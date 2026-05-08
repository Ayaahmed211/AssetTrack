package com.assettrack.backend.controller;

import com.assettrack.backend.dto.NotificationResponse;
import com.assettrack.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for in-app notifications.
 * Base path: /api/notifications
 *
 * All endpoints are scoped to the currently authenticated user —
 * users can only see and manage their own notifications.
 *
 * Role access: ADMIN, MANAGER, DEVELOPER (all authenticated users)
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/notifications
     *
     * Returns ALL notifications for the currently logged-in user,
     * newest first. Includes both read and unread.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        return ResponseEntity.ok(notificationService.getMyNotifications());
    }

    /**
     * GET /api/notifications/unread
     *
     * Returns only UNREAD notifications for the current user.
     * Use this to populate the notification badge/bell in the frontend.
     */
    @GetMapping("/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<List<NotificationResponse>> getMyUnreadNotifications() {
        return ResponseEntity.ok(notificationService.getMyUnreadNotifications());
    }

    /**
     * GET /api/notifications/unread/count
     *
     * Returns the count of unread notifications for the current user.
     * Lightweight endpoint for the notification badge number.
     */
    @GetMapping("/unread/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        long count = notificationService.countMyUnread();
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    /**
     * POST /api/notifications/{id}/read
     *
     * Mark a single notification as read.
     * Returns the updated notification with readAt timestamp set.
     */
    @PostMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    /**
     * POST /api/notifications/read-all
     *
     * Mark ALL unread notifications as read in one call.
     * Returns the count of notifications that were marked.
     */
    @PostMapping("/read-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<Map<String, Integer>> markAllAsRead() {
        int count = notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("markedAsRead", count));
    }
}
