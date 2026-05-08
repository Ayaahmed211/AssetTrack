package com.assettrack.backend.service;

import com.assettrack.backend.domain.Asset;
import com.assettrack.backend.domain.AssetStatus;
import com.assettrack.backend.domain.AssetType;
import com.assettrack.backend.dto.AssetRequest;
import com.assettrack.backend.dto.AssetResponse;
import com.assettrack.backend.dto.AssetStatusUpdateRequest;
import com.assettrack.backend.exception.ResourceNotFoundException;
import com.assettrack.backend.repository.AssetRepository;
import com.assettrack.backend.repository.UserRepository;
import com.assettrack.backend.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for asset management.
 *
 * Warranty window: assets expiring within 30 days are flagged as EXPIRING_SOON.
 *
 * Member 5 integration note:
 *   getExpiredAssets() and getExpiringSoonAssets() are the entry points
 *   for the @Scheduled warranty alert task.
 *
 * Member 4 integration note:
 *   updateAssetStatus() will be called internally when an asset is assigned/unassigned.
 */
@Service
@RequiredArgsConstructor
public class AssetService {

    private static final int WARRANTY_EXPIRY_WARN_DAYS = 30;

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    // -------------------------------------------------------------------------
    // CRUD
    // -------------------------------------------------------------------------

    /**
     * Register a new asset. Rejects duplicate serial numbers.
     */
    @Transactional
    public AssetResponse createAsset(AssetRequest request) {
        if (assetRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new IllegalArgumentException(
                    "An asset with serial number '" + request.getSerialNumber() + "' already exists.");
        }
        validateWarrantyDate(request);

        Asset asset = Asset.builder()
                .type(request.getType())
                .brand(request.getBrand())
                .model(request.getModel())
                .serialNumber(request.getSerialNumber())
                .purchaseDate(request.getPurchaseDate())
                .warrantyExpirationDate(request.getWarrantyExpirationDate())
                .status(AssetStatus.AVAILABLE)
                .notes(request.getNotes())
                .build();

        return mapToResponse(assetRepository.save(asset));
    }

    /**
     * Retrieve all assets.
     */
    public List<AssetResponse> getAllAssets() {
        return assetRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve assets assigned to the currently logged-in user.
     */
    public List<AssetResponse> getMyAssets() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return assetRepository.findByAssignedToId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve a single asset by its ID.
     */
    public AssetResponse getAssetById(Long id) {
        return mapToResponse(findOrThrow(id));
    }

    /**
     * Retrieve a single asset by its serial number.
     */
    public AssetResponse getAssetBySerialNumber(String serialNumber) {
        Asset asset = assetRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Asset not found with serial number: " + serialNumber));
        return mapToResponse(asset);
    }

    /**
     * Full update of an asset's data.
     * If the serial number is changed, uniqueness is re-validated.
     */
    @Transactional
    public AssetResponse updateAsset(Long id, AssetRequest request) {
        Asset asset = findOrThrow(id);

        // Only check uniqueness if the serial number is being changed
        if (!asset.getSerialNumber().equals(request.getSerialNumber())
                && assetRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new IllegalArgumentException(
                    "An asset with serial number '" + request.getSerialNumber() + "' already exists.");
        }
        validateWarrantyDate(request);

        asset.setType(request.getType());
        asset.setBrand(request.getBrand());
        asset.setModel(request.getModel());
        asset.setSerialNumber(request.getSerialNumber());
        asset.setPurchaseDate(request.getPurchaseDate());
        asset.setWarrantyExpirationDate(request.getWarrantyExpirationDate());
        asset.setNotes(request.getNotes());

        return mapToResponse(assetRepository.save(asset));
    }

    /**
     * Update only the lifecycle status of an asset (e.g. AVAILABLE → DECOMMISSIONED).
     * Member 4 will call this internally when assigning/unassigning assets.
     */
    @Transactional
    public AssetResponse updateAssetStatus(Long id, AssetStatusUpdateRequest request) {
        Asset asset = findOrThrow(id);
        asset.setStatus(request.getStatus());
        return mapToResponse(assetRepository.save(asset));
    }

    /**
     * Permanently delete an asset record.
     */
    @Transactional
    public void deleteAsset(Long id) {
        Asset asset = findOrThrow(id);
        assetRepository.delete(asset);
    }

    // -------------------------------------------------------------------------
    // Filtering
    // -------------------------------------------------------------------------

    public List<AssetResponse> getAssetsByType(AssetType type) {
        return assetRepository.findByType(type)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AssetResponse> getAssetsByStatus(AssetStatus status) {
        return assetRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // Warranty Tracking (entry points for Member 5's scheduler)
    // -------------------------------------------------------------------------

    /**
     * Returns all assets whose warranty has already expired.
     */
    public List<AssetResponse> getExpiredAssets() {
        return assetRepository.findByWarrantyExpirationDateBefore(LocalDate.now())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns all assets whose warranty expires within the next 30 days.
     */
    public List<AssetResponse> getExpiringSoonAssets() {
        LocalDate today = LocalDate.now();
        LocalDate threshold = today.plusDays(WARRANTY_EXPIRY_WARN_DAYS);
        return assetRepository.findByWarrantyExpirationDateBetween(today, threshold)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // Spare Asset Logic
    // -------------------------------------------------------------------------

    /**
     * Returns all available spare laptops (type=LAPTOP, status=AVAILABLE).
     * Member 4 will enrich these responses with last-owner info from AllocationHistory.
     */
    public List<AssetResponse> getAvailableSpares() {
        return assetRepository.findByTypeAndStatus(AssetType.LAPTOP, AssetStatus.AVAILABLE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Asset findOrThrow(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
    }

    /**
     * Ensures warrantyExpirationDate is not before purchaseDate.
     */
    private void validateWarrantyDate(AssetRequest request) {
        if (request.getWarrantyExpirationDate() != null
                && request.getPurchaseDate() != null
                && request.getWarrantyExpirationDate().isBefore(request.getPurchaseDate())) {
            throw new IllegalArgumentException(
                    "Warranty expiration date cannot be before purchase date.");
        }
    }

    /**
     * Maps an Asset entity to an AssetResponse DTO.
     * Computes warrantyStatus and daysUntilWarrantyExpiry from today's date.
     */
    public AssetResponse mapToResponse(Asset asset) {
        LocalDate today = LocalDate.now();
        long daysUntilExpiry = ChronoUnit.DAYS.between(today, asset.getWarrantyExpirationDate());

        String warrantyStatus;
        if (daysUntilExpiry < 0) {
            warrantyStatus = "EXPIRED";
        } else if (daysUntilExpiry <= WARRANTY_EXPIRY_WARN_DAYS) {
            warrantyStatus = "EXPIRING_SOON";
        } else {
            warrantyStatus = "VALID";
        }

        return AssetResponse.builder()
                .id(asset.getId())
                .type(asset.getType())
                .brand(asset.getBrand())
                .model(asset.getModel())
                .serialNumber(asset.getSerialNumber())
                .purchaseDate(asset.getPurchaseDate())
                .warrantyExpirationDate(asset.getWarrantyExpirationDate())
                .status(asset.getStatus())
                .notes(asset.getNotes())
                .createdAt(asset.getCreatedAt())
                .updatedAt(asset.getUpdatedAt())
                .warrantyStatus(warrantyStatus)
                .daysUntilWarrantyExpiry(daysUntilExpiry)
                .build();
    }
}
