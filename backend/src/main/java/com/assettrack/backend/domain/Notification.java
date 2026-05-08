package com.assettrack.backend.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * JPA entity representing an in-app notification for a user.
 *
 * Notifications are created:
 *   - By the WarrantyScheduler (type = WARRANTY_EXPIRY / WARRANTY_EXPIRED)
 *   - By the AllocationService (type = ASSET_ASSIGNED)
 *   - By the AllocationService when a condition report is submitted (type = CONDITION_REPORT)
 *
 * The user marks them as read via POST /api/notifications/{id}/read.
 */
@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notif_user_id",       columnList = "user_id"),
        @Index(name = "idx_notif_user_unread",    columnList = "user_id, read"),
        @Index(name = "idx_notif_type",           columnList = "type")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user this notification is targeted at.
     * Loaded eagerly because notification lists always need the user's email.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Short one-line title shown in the notification bell. */
    @Column(nullable = false)
    private String title;

    /** Full message body. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /**
     * Notification category.
     * Valid values: WARRANTY_EXPIRY, WARRANTY_EXPIRED, ASSET_ASSIGNED, CONDITION_REPORT, SYSTEM
     */
    @Column(nullable = false)
    private String type;

    /** False until the user explicitly reads the notification. */
    @Column(nullable = false)
    @Builder.Default
    private boolean read = false;

    /** Timestamp when the notification was generated. */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    /** Timestamp when the user marked it as read (null if unread). */
    @Column
    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
