package com.assettrack.backend.service;

import com.assettrack.backend.domain.Notification;
import com.assettrack.backend.domain.User;
import com.assettrack.backend.dto.NotificationResponse;
import com.assettrack.backend.exception.ResourceNotFoundException;
import com.assettrack.backend.repository.NotificationRepository;
import com.assettrack.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for creating, retrieving, and marking in-app notifications.
 *
 * Called by:
 *   - WarrantyScheduler  → createWarrantyNotification()
 *   - AllocationService  → createAssignmentNotification() / createConditionReportNotification()
 *   - NotificationController → getUserNotifications(), markAsRead(), markAllAsRead()
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // ── Internal creation helpers (called by other services) ─────────────────

    /**
     * Create a warranty-expiring-soon in-app notification for a user.
     * Skips creation if an identical notification already exists (duplicate prevention).
     */
    @Transactional
    public void createWarrantyExpiringSoonNotification(User user, String assetSerial, long daysLeft) {
        String title   = "⚠️ Warranty Expiring Soon";
        String message = "Asset " + assetSerial + " warranty expires in " + daysLeft + " day(s).";
        if (isDuplicate(user.getId(), "WARRANTY_EXPIRY", assetSerial)) {
            log.debug("Skipping duplicate WARRANTY_EXPIRY notification for asset {}", assetSerial);
            return;
        }
        save(user, title, message, "WARRANTY_EXPIRY");
    }

    /**
     * Create a warranty-expired in-app notification for a user.
     */
    @Transactional
    public void createWarrantyExpiredNotification(User user, String assetSerial, long daysExpired) {
        String title   = "🚨 Warranty Expired";
        String message = "Asset " + assetSerial + " warranty expired " + daysExpired + " day(s) ago.";
        if (isDuplicate(user.getId(), "WARRANTY_EXPIRED", assetSerial)) {
            return;
        }
        save(user, title, message, "WARRANTY_EXPIRED");
    }

    /**
     * Notify a user that an asset has been assigned to them.
     */
    @Transactional
    public void createAssignmentNotification(User assignedTo, String assetSerial,
                                              String brand, String model) {
        String title   = "📦 Asset Assigned to You";
        String message = "You have been assigned: " + brand + " " + model + " (S/N: " + assetSerial + ").";
        save(assignedTo, title, message, "ASSET_ASSIGNED");
    }

    /**
     * Notify admins/managers that a condition report was filed.
     */
    @Transactional
    public void createConditionReportNotification(User admin, String assetSerial,
                                                   String conditionStatus, String reporterName) {
        String title   = "🔧 Condition Report Filed";
        String message = reporterName + " reported condition '" + conditionStatus
                       + "' for asset " + assetSerial + ".";
        save(admin, title, message, "CONDITION_REPORT");
    }

    // ── REST-facing methods ───────────────────────────────────────────────────

    /**
     * Get all notifications for the currently authenticated user (newest first).
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {
        User currentUser = getCurrentUser();
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get only unread notifications for the currently authenticated user.
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyUnreadNotifications() {
        User currentUser = getCurrentUser();
        return notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Count unread notifications for the notification badge.
     */
    @Transactional(readOnly = true)
    public long countMyUnread() {
        User currentUser = getCurrentUser();
        return notificationRepository.countByUserIdAndReadFalse(currentUser.getId());
    }

    /**
     * Mark a single notification as read.
     * Only the owning user can mark their own notification.
     */
    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        User currentUser = getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Notification not found with id: " + notificationId);
        }

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        return mapToResponse(notificationRepository.save(notification));
    }

    /**
     * Mark ALL unread notifications for the current user as read.
     */
    @Transactional
    public int markAllAsRead() {
        User currentUser = getCurrentUser();
        List<Notification> unread = notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(currentUser.getId());
        LocalDateTime now = LocalDateTime.now();
        for (Notification n : unread) {
            n.setRead(true);
            n.setReadAt(now);
        }
        notificationRepository.saveAll(unread);
        return unread.size();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void save(User user, String title, String message, String type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
        log.info("Notification created for user {}: [{}] {}", user.getEmail(), type, title);
    }

    private boolean isDuplicate(Long userId, String type, String assetSerial) {
        return notificationRepository
                .existsByUserIdAndTypeAndMessageContaining(userId, type, assetSerial);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .userId(n.getUser().getId())
                .userEmail(n.getUser().getEmail())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .readAt(n.getReadAt())
                .build();
    }
}
