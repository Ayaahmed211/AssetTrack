package com.assettrack.backend.controller;

import com.assettrack.backend.domain.AssetStatus;
import com.assettrack.backend.domain.AssetType;
import com.assettrack.backend.dto.AssetRequest;
import com.assettrack.backend.dto.AssetResponse;
import com.assettrack.backend.dto.AssetStatusUpdateRequest;
import com.assettrack.backend.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for asset management.
 * Base path: /api/assets
 *
 * Role access summary:
 *   ADMIN + MANAGER : create, update, delete, view warranty alerts
 *   DEVELOPER       : read-only (get, filter, spares)
 *   ADMIN only      : delete
 */
@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    // -------------------------------------------------------------------------
    // CRUD
    // -------------------------------------------------------------------------

    /**
     * POST /api/assets
     * Register a new asset. Only ADMIN and MANAGER can add assets.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AssetResponse> createAsset(@Valid @RequestBody AssetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createAsset(request));
    }

    /**
     * GET /api/assets
     * Retrieve all assets. All authenticated users can view.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<List<AssetResponse>> getAllAssets() {
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    /**
     * GET /api/assets/{id}
     * Retrieve a single asset by its database ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<AssetResponse> getAssetById(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAssetById(id));
    }

    /**
     * GET /api/assets/serial/{serialNumber}
     * Retrieve a single asset by its unique serial number.
     */
    @GetMapping("/serial/{serialNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<AssetResponse> getAssetBySerialNumber(@PathVariable String serialNumber) {
        return ResponseEntity.ok(assetService.getAssetBySerialNumber(serialNumber));
    }

    /**
     * PUT /api/assets/{id}
     * Full update of an asset's data. Only ADMIN and MANAGER.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AssetResponse> updateAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetRequest request) {
        return ResponseEntity.ok(assetService.updateAsset(id, request));
    }

    /**
     * PATCH /api/assets/{id}/status
     * Update only the lifecycle status (e.g. mark as DECOMMISSIONED). ADMIN and MANAGER only.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AssetResponse> updateAssetStatus(
            @PathVariable Long id,
            @Valid @RequestBody AssetStatusUpdateRequest request) {
        return ResponseEntity.ok(assetService.updateAssetStatus(id, request));
    }

    /**
     * DELETE /api/assets/{id}
     * Permanently remove an asset. ADMIN only.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------------------
    // Filtering
    // -------------------------------------------------------------------------

    /**
     * GET /api/assets/type/{type}
     * Filter assets by type: LAPTOP, MONITOR, or ACCESSORY.
     */
    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<List<AssetResponse>> getAssetsByType(@PathVariable AssetType type) {
        return ResponseEntity.ok(assetService.getAssetsByType(type));
    }

    /**
     * GET /api/assets/status/{status}
     * Filter assets by lifecycle status: AVAILABLE, ASSIGNED, UNDER_MAINTENANCE, DECOMMISSIONED.
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<List<AssetResponse>> getAssetsByStatus(@PathVariable AssetStatus status) {
        return ResponseEntity.ok(assetService.getAssetsByStatus(status));
    }

    // -------------------------------------------------------------------------
    // Warranty Tracking
    // -------------------------------------------------------------------------

    /**
     * GET /api/assets/warranty/expired
     * Returns all assets whose warranty has already expired.
     * Restricted to ADMIN and MANAGER.
     */
    @GetMapping("/warranty/expired")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AssetResponse>> getExpiredAssets() {
        return ResponseEntity.ok(assetService.getExpiredAssets());
    }

    /**
     * GET /api/assets/warranty/expiring-soon
     * Returns all assets whose warranty expires within the next 30 days.
     * Restricted to ADMIN and MANAGER.
     */
    @GetMapping("/warranty/expiring-soon")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AssetResponse>> getExpiringSoonAssets() {
        return ResponseEntity.ok(assetService.getExpiringSoonAssets());
    }

    // -------------------------------------------------------------------------
    // Spare Asset Logic
    // -------------------------------------------------------------------------

    /**
     * GET /api/assets/spares
     * Returns all available spare laptops (type=LAPTOP, status=AVAILABLE).
     * All authenticated users can access this to find a spare quickly.
     */
    @GetMapping("/spares")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<List<AssetResponse>> getAvailableSpares() {
        return ResponseEntity.ok(assetService.getAvailableSpares());
    }
}
