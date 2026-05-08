package com.assettrack.backend.controller;

import com.assettrack.backend.dto.DashboardStatsResponse;
import com.assettrack.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for the dashboard statistics endpoint.
 * Base path: /api/dashboard
 *
 * Role access:
 *   ADMIN + MANAGER : full stats
 *   DEVELOPER       : denied (dashboard is for management only)
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * GET /api/dashboard/stats
     *
     * Returns a comprehensive snapshot of the system state:
     *   - total assets, users, allocation events, condition reports
     *   - assets broken down by status and type
     *   - warranty health counts (expired / expiring-soon / valid)
     *   - condition reports grouped by condition status
     *   - currently active assignments and available spare laptops
     *
     * Roles: ADMIN, MANAGER
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }
}
