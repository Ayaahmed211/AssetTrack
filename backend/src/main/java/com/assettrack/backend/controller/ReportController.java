package com.assettrack.backend.controller;

import com.assettrack.backend.dto.AssetLifecycleResponse;
import com.assettrack.backend.dto.ConditionSummaryResponse;
import com.assettrack.backend.dto.UsageStatsResponse;
import com.assettrack.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for analytics and reporting.
 * Base path: /api/reports
 *
 * Role access:
 *   ADMIN + MANAGER : all report endpoints
 *   DEVELOPER       : denied (reports are management-level views)
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * GET /api/reports/usage-stats
     *
     * Detailed allocation usage report:
     *   - total allocation events
     *   - breakdown by action type (ASSIGNED / TRANSFERRED / RETURNED)
     *   - top 5 most-assigned users
     *   - top 5 most-allocated assets
     *   - currently active (not returned) assignment count
     *
     * Roles: ADMIN, MANAGER
     */
    @GetMapping("/usage-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<UsageStatsResponse> getUsageStats() {
        return ResponseEntity.ok(reportService.getUsageStats());
    }

    /**
     * GET /api/reports/condition-summary
     *
     * Condition report breakdown:
     *   - total reports
     *   - count per condition status (GOOD, FAIR, DAMAGED, UNDER_REPAIR, DECOMMISSIONED)
     *   - top 5 assets with the most reports (potential trouble assets)
     *
     * Roles: ADMIN, MANAGER
     */
    @GetMapping("/condition-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ConditionSummaryResponse> getConditionSummary() {
        return ResponseEntity.ok(reportService.getConditionSummary());
    }

    /**
     * GET /api/reports/asset-lifecycle/{id}
     *
     * Full chronological timeline for a single asset:
     *   - asset metadata (serial, brand, model, type, current status, warranty health)
     *   - all allocation events (ASSIGNED → TRANSFERRED → RETURNED) with timestamps and actors
     *   - all condition reports filed, newest first
     *
     * Roles: ADMIN, MANAGER
     */
    @GetMapping("/asset-lifecycle/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AssetLifecycleResponse> getAssetLifecycle(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getAssetLifecycle(id));
    }
}
