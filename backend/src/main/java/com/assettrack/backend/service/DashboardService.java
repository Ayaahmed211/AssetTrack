package com.assettrack.backend.service;

import com.assettrack.backend.domain.AssetStatus;
import com.assettrack.backend.domain.AssetType;
import com.assettrack.backend.dto.DashboardStatsResponse;
import com.assettrack.backend.repository.AllocationHistoryRepository;
import com.assettrack.backend.repository.AssetRepository;
import com.assettrack.backend.repository.ConditionReportRepository;
import com.assettrack.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Business logic for the dashboard statistics endpoint.
 *
 * All counts are computed at query time (no caching) to always reflect
 * the live state of the database. For high-traffic production use, a
 * short-lived cache (@Cacheable) could be added.
 *
 * Used by: GET /api/dashboard/stats
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final int WARRANTY_WARN_DAYS = 30;

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AllocationHistoryRepository allocationHistoryRepository;
    private final ConditionReportRepository conditionReportRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {

        LocalDate today = LocalDate.now();
        LocalDate threshold = today.plusDays(WARRANTY_WARN_DAYS);

        // ── Total counts ──────────────────────────────────────────────────────
        long totalAssets = assetRepository.count();
        long totalUsers  = userRepository.count();
        long totalAllocs = allocationHistoryRepository.count();
        long totalReports = conditionReportRepository.count();

        // ── Assets by status ──────────────────────────────────────────────────
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (AssetStatus status : AssetStatus.values()) {
            byStatus.put(status.name(), assetRepository.countByStatus(status));
        }

        // ── Assets by type ────────────────────────────────────────────────────
        Map<String, Long> byType = new LinkedHashMap<>();
        for (AssetType type : AssetType.values()) {
            byType.put(type.name(), assetRepository.countByType(type));
        }

        // ── Warranty health ───────────────────────────────────────────────────
        long expired      = assetRepository.countByWarrantyExpirationDateBefore(today);
        long expiringSoon = assetRepository.countByWarrantyExpirationDateBetween(today, threshold);
        long valid        = totalAssets - expired - expiringSoon;

        // ── Condition reports by status ───────────────────────────────────────
        Map<String, Long> byConditionStatus = conditionReportRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        r -> r.getConditionStatus() != null ? r.getConditionStatus() : "UNKNOWN",
                        Collectors.counting()
                ));

        // ── Active assignments & spares ───────────────────────────────────────
        long activeAssignments = assetRepository.countByStatus(AssetStatus.ASSIGNED);
        long availableSpares   = assetRepository.countByTypeAndStatus(AssetType.LAPTOP, AssetStatus.AVAILABLE);

        return DashboardStatsResponse.builder()
                .totalAssets(totalAssets)
                .totalUsers(totalUsers)
                .totalAllocations(totalAllocs)
                .totalConditionReports(totalReports)
                .assetsByStatus(byStatus)
                .assetsByType(byType)
                .expiredWarranties(expired)
                .expiringSoonWarranties(expiringSoon)
                .validWarranties(valid)
                .conditionReportsByStatus(byConditionStatus)
                .activeAssignments(activeAssignments)
                .availableSpares(availableSpares)
                .build();
    }
}
