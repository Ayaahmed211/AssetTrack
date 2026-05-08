package com.assettrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for the usage statistics report.
 * Used by: GET /api/reports/usage-stats
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageStatsResponse {

    /** Total allocation events ever recorded. */
    private long totalAllocationEvents;

    /** Breakdown by action type: ASSIGNED, TRANSFERRED, RETURNED */
    private Map<String, Long> allocationsByActionType;

    /** Top 5 most-assigned users (userId → fullName → count). */
    private List<UserAllocationStat> topAssignedUsers;

    /** Top 5 most-allocated assets (assetId → serialNumber → count). */
    private List<AssetAllocationStat> topAllocatedAssets;

    /** Count of currently active (not returned) assignments. */
    private long currentlyAssignedAssets;

    // ── Nested stats records ─────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserAllocationStat {
        private Long userId;
        private String fullName;
        private String email;
        private long allocationCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssetAllocationStat {
        private Long assetId;
        private String serialNumber;
        private String brand;
        private String model;
        private long allocationCount;
    }
}
