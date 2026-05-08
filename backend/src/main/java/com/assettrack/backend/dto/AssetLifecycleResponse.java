package com.assettrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for the full lifecycle timeline of a single asset.
 * Used by: GET /api/reports/asset-lifecycle/{id}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetLifecycleResponse {

    /** Core asset info. */
    private Long assetId;
    private String serialNumber;
    private String brand;
    private String model;
    private String type;
    private String currentStatus;
    private String warrantyStatus;

    /** Chronological list of all allocation events (assign, transfer, return). */
    private List<AllocationEvent> allocationHistory;

    /** All condition reports ever filed for this asset. */
    private List<ConditionEvent> conditionHistory;

    // ── Nested event records ─────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AllocationEvent {
        private Long eventId;
        private String actionType;           // ASSIGNED | TRANSFERRED | RETURNED
        private String assignedToFullName;
        private String assignedFromFullName; // null for first assignment
        private String assignedByFullName;
        private LocalDateTime assignedAt;
        private LocalDateTime returnedAt;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConditionEvent {
        private Long reportId;
        private String conditionStatus;
        private String description;
        private String reportedByFullName;
        private LocalDateTime reportedAt;
    }
}
