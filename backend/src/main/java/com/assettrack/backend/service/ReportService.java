package com.assettrack.backend.service;

import com.assettrack.backend.domain.AllocationHistory;
import com.assettrack.backend.domain.Asset;
import com.assettrack.backend.domain.ConditionReport;
import com.assettrack.backend.dto.AssetLifecycleResponse;
import com.assettrack.backend.dto.ConditionSummaryResponse;
import com.assettrack.backend.dto.UsageStatsResponse;
import com.assettrack.backend.exception.ResourceNotFoundException;
import com.assettrack.backend.repository.AllocationHistoryRepository;
import com.assettrack.backend.repository.AssetRepository;
import com.assettrack.backend.repository.ConditionReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Business logic for analytics and reporting endpoints.
 *
 * Endpoints served:
 *   GET /api/reports/usage-stats        → allocation event summary
 *   GET /api/reports/condition-summary  → condition report breakdown
 *   GET /api/reports/asset-lifecycle/{id} → full timeline for one asset
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final AllocationHistoryRepository allocationHistoryRepository;
    private final ConditionReportRepository conditionReportRepository;
    private final AssetRepository assetRepository;

    // ── Usage Statistics ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public UsageStatsResponse getUsageStats() {
        List<AllocationHistory> allHistory = allocationHistoryRepository.findAll();

        // Breakdown by action type
        Map<String, Long> byActionType = allHistory.stream()
                .collect(Collectors.groupingBy(
                        h -> h.getActionType() != null ? h.getActionType() : "UNKNOWN",
                        Collectors.counting()
                ));

        // Top 5 users by allocation count
        Map<Long, Long> userCounts = allHistory.stream()
                .filter(h -> h.getAssignedTo() != null)
                .collect(Collectors.groupingBy(
                        h -> h.getAssignedTo().getId(),
                        Collectors.counting()
                ));

        List<UsageStatsResponse.UserAllocationStat> topUsers = userCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    // find a history entry for this user to get name/email
                    AllocationHistory sample = allHistory.stream()
                            .filter(h -> h.getAssignedTo() != null
                                    && h.getAssignedTo().getId().equals(e.getKey()))
                            .findFirst().orElseThrow();
                    return UsageStatsResponse.UserAllocationStat.builder()
                            .userId(e.getKey())
                            .fullName(sample.getAssignedTo().getFullName())
                            .email(sample.getAssignedTo().getEmail())
                            .allocationCount(e.getValue())
                            .build();
                })
                .collect(Collectors.toList());

        // Top 5 assets by allocation count
        Map<Long, Long> assetCounts = allHistory.stream()
                .filter(h -> h.getAsset() != null)
                .collect(Collectors.groupingBy(
                        h -> h.getAsset().getId(),
                        Collectors.counting()
                ));

        List<UsageStatsResponse.AssetAllocationStat> topAssets = assetCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    AllocationHistory sample = allHistory.stream()
                            .filter(h -> h.getAsset() != null
                                    && h.getAsset().getId().equals(e.getKey()))
                            .findFirst().orElseThrow();
                    return UsageStatsResponse.AssetAllocationStat.builder()
                            .assetId(e.getKey())
                            .serialNumber(sample.getAsset().getSerialNumber())
                            .brand(sample.getAsset().getBrand())
                            .model(sample.getAsset().getModel())
                            .allocationCount(e.getValue())
                            .build();
                })
                .collect(Collectors.toList());

        // Currently assigned (no returnedAt)
        long currentlyAssigned = allHistory.stream()
                .filter(h -> "ASSIGNED".equals(h.getActionType()) && h.getReturnedAt() == null)
                .count();

        return UsageStatsResponse.builder()
                .totalAllocationEvents((long) allHistory.size())
                .allocationsByActionType(byActionType)
                .topAssignedUsers(topUsers)
                .topAllocatedAssets(topAssets)
                .currentlyAssignedAssets(currentlyAssigned)
                .build();
    }

    // ── Condition Summary ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ConditionSummaryResponse getConditionSummary() {
        List<ConditionReport> allReports = conditionReportRepository.findAll();

        // Count by condition status
        Map<String, Long> byStatus = allReports.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getConditionStatus() != null ? r.getConditionStatus() : "UNKNOWN",
                        Collectors.counting()
                ));

        // Top 5 assets with the most reports
        Map<Long, List<ConditionReport>> reportsByAsset = allReports.stream()
                .filter(r -> r.getAsset() != null)
                .collect(Collectors.groupingBy(r -> r.getAsset().getId()));

        List<ConditionSummaryResponse.AssetConditionStat> topReportedAssets =
                reportsByAsset.entrySet().stream()
                        .sorted((a, b) -> Long.compare(b.getValue().size(), a.getValue().size()))
                        .limit(5)
                        .map(e -> {
                            List<ConditionReport> reports = e.getValue();
                            ConditionReport latest = reports.stream()
                                    .max(Comparator.comparing(ConditionReport::getReportedAt))
                                    .orElseThrow();
                            return ConditionSummaryResponse.AssetConditionStat.builder()
                                    .assetId(e.getKey())
                                    .serialNumber(latest.getAsset().getSerialNumber())
                                    .brand(latest.getAsset().getBrand())
                                    .model(latest.getAsset().getModel())
                                    .latestConditionStatus(latest.getConditionStatus())
                                    .reportCount((long) reports.size())
                                    .build();
                        })
                        .collect(Collectors.toList());

        return ConditionSummaryResponse.builder()
                .totalReports((long) allReports.size())
                .reportsByConditionStatus(byStatus)
                .topReportedAssets(topReportedAssets)
                .build();
    }

    // ── Asset Lifecycle Timeline ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AssetLifecycleResponse getAssetLifecycle(Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Asset not found with id: " + assetId));

        // Allocation events sorted chronologically
        List<AssetLifecycleResponse.AllocationEvent> allocationEvents =
                allocationHistoryRepository.findByAssetIdOrderByAssignedAtDesc(assetId)
                        .stream()
                        .map(h -> AssetLifecycleResponse.AllocationEvent.builder()
                                .eventId(h.getId())
                                .actionType(h.getActionType())
                                .assignedToFullName(h.getAssignedTo() != null
                                        ? h.getAssignedTo().getFullName() : null)
                                .assignedFromFullName(h.getAssignedFrom() != null
                                        ? h.getAssignedFrom().getFullName() : null)
                                .assignedByFullName(h.getAssignedBy() != null
                                        ? h.getAssignedBy().getFullName() : null)
                                .assignedAt(h.getAssignedAt())
                                .returnedAt(h.getReturnedAt())
                                .notes(h.getNotes())
                                .build())
                        .collect(Collectors.toList());

        // Condition reports sorted newest first
        List<AssetLifecycleResponse.ConditionEvent> conditionEvents =
                conditionReportRepository.findByAssetIdOrderByReportedAtDesc(assetId)
                        .stream()
                        .map(r -> AssetLifecycleResponse.ConditionEvent.builder()
                                .reportId(r.getId())
                                .conditionStatus(r.getConditionStatus())
                                .description(r.getDescription())
                                .reportedByFullName(r.getReportedBy() != null
                                        ? r.getReportedBy().getFullName() : "Unknown")
                                .reportedAt(r.getReportedAt())
                                .build())
                        .collect(Collectors.toList());

        // Compute warrantyStatus inline
        long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(
                java.time.LocalDate.now(), asset.getWarrantyExpirationDate());
        String warrantyStatus = daysLeft < 0 ? "EXPIRED"
                : daysLeft <= 30 ? "EXPIRING_SOON"
                : "VALID";

        return AssetLifecycleResponse.builder()
                .assetId(asset.getId())
                .serialNumber(asset.getSerialNumber())
                .brand(asset.getBrand())
                .model(asset.getModel())
                .type(asset.getType().name())
                .currentStatus(asset.getStatus().name())
                .warrantyStatus(warrantyStatus)
                .allocationHistory(allocationEvents)
                .conditionHistory(conditionEvents)
                .build();
    }
}
