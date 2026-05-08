package com.assettrack.backend.repository;

import com.assettrack.backend.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Notification persistence.
 *
 * Used by:
 *   - NotificationService: retrieve and mark-as-read
 *   - WarrantyScheduler: persist warranty alerts
 *   - AllocationService (via NotificationService): asset assignment notifications
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** Fetch all notifications for a user, newest first. */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Fetch only unread notifications for a user. */
    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId);

    /** Count unread notifications for the notification badge. */
    long countByUserIdAndReadFalse(Long userId);

    /** Check if a warranty notification already exists for this asset to avoid duplicates. */
    boolean existsByUserIdAndTypeAndMessageContaining(Long userId, String type, String message);
}
