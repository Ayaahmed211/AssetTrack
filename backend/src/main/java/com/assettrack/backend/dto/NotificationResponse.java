package com.assettrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for in-app notifications.
 * Used by: GET /api/notifications, POST /api/notifications/{id}/read
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long id;

    /** The user this notification belongs to. */
    private Long userId;
    private String userEmail;

    /** Short title, e.g. "Warranty Expiring Soon" */
    private String title;

    /** Full notification body text. */
    private String message;

    /** Category: WARRANTY_EXPIRY, WARRANTY_EXPIRED, ASSET_ASSIGNED, CONDITION_REPORT, SYSTEM */
    private String type;

    /** Whether the user has seen/dismissed this notification. */
    private boolean read;

    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
