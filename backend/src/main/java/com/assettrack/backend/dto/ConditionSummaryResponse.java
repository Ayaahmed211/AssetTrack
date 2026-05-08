package com.assettrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for the condition report summary endpoint.
 * Used by: GET /api/reports/condition-summary
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConditionSummaryResponse {

    /** Total number of condition reports in the system. */
    private long totalReports;

    /** Count grouped by conditionStatus (GOOD, FAIR, DAMAGED, UNDER_REPAIR, DECOMMISSIONED). */
    private Map<String, Long> reportsByConditionStatus;

    /** Assets with the most condition reports (potential trouble assets). */
    private List<AssetConditionStat> topReportedAssets;

    // ── Nested record ────────────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssetConditionStat {
        private Long assetId;
        private String serialNumber;
        private String brand;
        private String model;
        private String latestConditionStatus;
        private long reportCount;
    }
}
