package com.assettrack.backend.service;

import com.assettrack.backend.domain.*;
import com.assettrack.backend.dto.*;
import com.assettrack.backend.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AllocationService {

    private final AllocationHistoryRepository allocationRepo;
    private final ConditionReportRepository conditionRepo;
    private final AssetRepository assetRepo;
    private final UserRepository userRepo;

    public AllocationService(AllocationHistoryRepository allocationRepo,
                             ConditionReportRepository conditionRepo,
                             AssetRepository assetRepo,
                             UserRepository userRepo) {
        this.allocationRepo = allocationRepo;
        this.conditionRepo = conditionRepo;
        this.assetRepo = assetRepo;
        this.userRepo = userRepo;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        if (email == null || email.equals("anonymousUser")) {
            return userRepo.findById(1L)
                    .orElseThrow(() -> new RuntimeException("No admin user found"));
        }
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    private Asset findAsset(Long assetId) {
        return assetRepo.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found: " + assetId));
    }

    private User findUser(Long userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    // ── ASSIGN ───────────────────────────────────────────────────────────
    public AllocationHistory assignAsset(AllocationRequest request) {
        Asset asset = findAsset(request.getAssetId());
        User assignedTo = findUser(request.getAssignedToUserId());
        User assignedBy = getCurrentUser();

        if (asset.getStatus() == AssetStatus.ASSIGNED) {
            throw new RuntimeException("Asset already assigned. Use /transfer instead.");
        }

        asset.setAssignedTo(assignedTo);
        asset.setStatus(AssetStatus.ASSIGNED);
        assetRepo.save(asset);

        AllocationHistory history = AllocationHistory.builder()
                .asset(asset)
                .assignedTo(assignedTo)
                .assignedBy(assignedBy)
                .assignedAt(LocalDateTime.now())
                .actionType("ASSIGNED")
                .notes(request.getNotes())
                .build();

        return allocationRepo.save(history);
    }

    // ── TRANSFER ─────────────────────────────────────────────────────────
    public AllocationHistory transferAsset(AllocationRequest request) {
        Asset asset = findAsset(request.getAssetId());
        User newOwner = findUser(request.getAssignedToUserId());
        User assignedBy = getCurrentUser();

        User previousOwner = null;
        if (asset.getAssignedTo() != null) {
            previousOwner = findUser(asset.getAssignedTo().getId());
        }

        asset.setAssignedTo(newOwner);
        asset.setStatus(AssetStatus.ASSIGNED);
        assetRepo.save(asset);

        AllocationHistory history = AllocationHistory.builder()
                .asset(asset)
                .assignedFrom(previousOwner)
                .assignedTo(newOwner)
                .assignedBy(assignedBy)
                .assignedAt(LocalDateTime.now())
                .actionType("TRANSFERRED")
                .notes(request.getNotes())
                .build();

        return allocationRepo.save(history);
    }

    // ── RETURN ───────────────────────────────────────────────────────────
    public AllocationHistory returnAsset(ReturnRequest request) {
        Asset asset = findAsset(request.getAssetId());
        User assignedBy = getCurrentUser();

        User previousOwner = null;
        if (asset.getAssignedTo() != null) {
            previousOwner = findUser(asset.getAssignedTo().getId());
        }

        asset.setAssignedTo(null);
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepo.save(asset);

        AllocationHistory history = AllocationHistory.builder()
                .asset(asset)
                .assignedFrom(previousOwner)
                .assignedBy(assignedBy)
                .assignedAt(LocalDateTime.now())
                .returnedAt(LocalDateTime.now())
                .actionType("RETURNED")
                .notes(request.getNotes())
                .build();

        return allocationRepo.save(history);
    }

    // ── HISTORY READS ─────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AllocationHistory> getHistoryByAsset(Long assetId) {
        return allocationRepo.findByAssetIdOrderByAssignedAtDesc(assetId);
    }

    @Transactional(readOnly = true)
    public List<AllocationHistory> getHistoryByUser(Long userId) {
        return allocationRepo.findByAssignedToIdOrderByAssignedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<AllocationHistory> getAllHistory() {
        return allocationRepo.findAll();
    }

    // ── CONDITION REPORTS ─────────────────────────────────────────────────
    public ConditionReport createConditionReport(ConditionReportRequest request) {
        Asset asset = findAsset(request.getAssetId());
        User reportedBy = getCurrentUser();

        ConditionReport report = ConditionReport.builder()
                .asset(asset)
                .reportedBy(reportedBy)
                .conditionStatus(request.getConditionStatus())
                .description(request.getDescription())
                .reportedAt(LocalDateTime.now())
                .build();

        return conditionRepo.save(report);
    }

    @Transactional(readOnly = true)
    public List<ConditionReport> getReportsByAsset(Long assetId) {
        return conditionRepo.findByAssetIdOrderByReportedAtDesc(assetId);
    }

    @Transactional(readOnly = true)
    public List<ConditionReport> getAllConditionReports() {
        return conditionRepo.findAll();
    }
}