package com.assettrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Response DTO for the dashboard statistics endpoint.
 * Aggregates asset counts, warranty status counts, and condition report counts.
 * Used by: GET /api/dashboard/stats
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    // ── Total Counts ─────────────────────────────────────────────────────────
    private long totalAssets;
    private long totalUsers;
    private long totalAllocations;
    private long totalConditionReports;

    // ── Assets by Status ─────────────────────────────────────────────────────
    // Keys: AVAILABLE, ASSIGNED, UNDER_MAINTENANCE, DECOMMISSIONED
    private Map<String, Long> assetsByStatus;

    // ── Assets by Type ───────────────────────────────────────────────────────
    // Keys: LAPTOP, MONITOR, ACCESSORY
    private Map<String, Long> assetsByType;

    // ── Warranty Health ──────────────────────────────────────────────────────
    private long expiredWarranties;
    private long expiringSoonWarranties;   // within 30 days
    private long validWarranties;

    // ── Condition Report Summary ─────────────────────────────────────────────
    // Keys: GOOD, FAIR, DAMAGED, UNDER_REPAIR, DECOMMISSIONED
    private Map<String, Long> conditionReportsByStatus;

    // ── Allocation Summary ───────────────────────────────────────────────────
    private long activeAssignments;        // assets currently ASSIGNED
    private long availableSpares;          // LAPTOP + AVAILABLE
}
