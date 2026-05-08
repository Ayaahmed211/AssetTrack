package com.assettrack.backend.service;

import com.assettrack.backend.domain.*;
import com.assettrack.backend.dto.*;
import com.assettrack.backend.exception.ResourceNotFoundException;
import com.assettrack.backend.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@Transactional
public class AllocationService {

    private final AllocationHistoryRepository allocationRepo;
    private final ConditionReportRepository conditionRepo;
    private final AssetRepository assetRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public AllocationService(AllocationHistoryRepository allocationRepo,
                             ConditionReportRepository conditionRepo,
                             AssetRepository assetRepo,
                             UserRepository userRepo,
                             NotificationService notificationService,
                             EmailService emailService) {
        this.allocationRepo = allocationRepo;
        this.conditionRepo = conditionRepo;
        this.assetRepo = assetRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
        this.emailService = emailService;
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
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    // ── ASSIGN ───────────────────────────────────────────────────────────
    public AllocationHistory assignAsset(AllocationRequest request) {
        Asset asset = findAsset(request.getAssetId());
        User assignedTo = findUser(request.getAssignedToUserId());
        User assignedBy = getCurrentUser();

        if (asset.getStatus() == AssetStatus.ASSIGNED) {
            throw new IllegalArgumentException("Asset '" + asset.getSerialNumber() + "' is already assigned. Use /transfer instead.");
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

        AllocationHistory saved = allocationRepo.save(history);

        // Notify the user that the asset was assigned to them
        notifyAssignment(assignedTo, asset);
        log.info("Asset {} assigned to user {}", asset.getSerialNumber(), assignedTo.getEmail());

        return saved;
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

        AllocationHistory saved = allocationRepo.save(history);

        // Notify the new owner
        notifyAssignment(newOwner, asset);
        log.info("Asset {} transferred to user {}", asset.getSerialNumber(), newOwner.getEmail());

        return saved;
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

    /**
     * Paginated version of getAllHistory.
     * Used by GET /api/allocations/history?page=0&size=20
     * Default: page 0, size 20, sorted by assignedAt DESC.
     */
    @Transactional(readOnly = true)
    public Page<AllocationHistory> getAllHistoryPaged(Pageable pageable) {
        return allocationRepo.findAllByOrderByAssignedAtDesc(pageable);
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

        ConditionReport saved = conditionRepo.save(report);

        // Notify all ADMINs and MANAGERs about the filed report
        notifyConditionReport(asset, request.getConditionStatus(),
                reportedBy.getFullName(), request.getDescription());
        log.info("Condition report filed for asset {} by {}",
                asset.getSerialNumber(), reportedBy.getEmail());

        return saved;
    }

    @Transactional(readOnly = true)
    public List<ConditionReport> getReportsByAsset(Long assetId) {
        return conditionRepo.findByAssetIdOrderByReportedAtDesc(assetId);
    }

    @Transactional(readOnly = true)
    public List<ConditionReport> getAllConditionReports() {
        return conditionRepo.findAll();
    }

    // ── Private notification helpers ──────────────────────────────────────────

    /**
     * Send in-app notification + email when an asset is assigned or transferred.
     * Runs within the same transaction — notification is persisted atomically.
     */
    private void notifyAssignment(User assignedTo, Asset asset) {
        try {
            notificationService.createAssignmentNotification(
                    assignedTo,
                    asset.getSerialNumber(),
                    asset.getBrand(),
                    asset.getModel());
            // Email is @Async — won't block the transaction
            emailService.sendAssetAssignedNotification(
                    assignedTo.getEmail(),
                    assignedTo.getFullName(),
                    asset.getSerialNumber(),
                    asset.getBrand(),
                    asset.getModel());
        } catch (Exception e) {
            // Notification failure must never roll back the allocation
            log.warn("Failed to send assignment notification to {}: {}",
                    assignedTo.getEmail(), e.getMessage());
        }
    }

    /**
     * Notify all ADMIN and MANAGER users when a condition report is filed.
     */
    private void notifyConditionReport(Asset asset, String conditionStatus,
                                        String reporterName, String description) {
        List<User> admins   = userRepo.findByRole(Role.ADMIN);
        List<User> managers = userRepo.findByRole(Role.MANAGER);
        admins.addAll(managers);

        for (User admin : admins) {
            try {
                notificationService.createConditionReportNotification(
                        admin,
                        asset.getSerialNumber(),
                        conditionStatus,
                        reporterName);
                emailService.sendConditionReportAlert(
                        admin.getEmail(),
                        admin.getFullName(),
                        asset.getSerialNumber(),
                        conditionStatus,
                        reporterName,
                        description);
            } catch (Exception e) {
                log.warn("Failed to send condition report notification to {}: {}",
                        admin.getEmail(), e.getMessage());
            }
        }
    }
}