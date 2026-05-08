package com.assettrack.backend.dto;

import com.assettrack.backend.domain.AssetStatus;
import com.assettrack.backend.domain.AssetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for advanced asset search.
 * All fields are optional — only non-null fields are used as filters.
 * Used by: GET /api/assets/search  (query params mapped to this object)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetSearchRequest {

    /** Partial or exact match on serial number (case-insensitive). */
    private String serialNumber;

    /** Partial or exact match on brand (case-insensitive). */
    private String brand;

    /** Partial or exact match on model (case-insensitive). */
    private String model;

    /** Filter by lifecycle status: AVAILABLE, ASSIGNED, UNDER_MAINTENANCE, DECOMMISSIONED */
    private AssetStatus status;

    /** Filter by hardware type: LAPTOP, MONITOR, ACCESSORY */
    private AssetType type;

    /** Filter by the ID of the user the asset is currently assigned to. */
    private Long assignedUserId;

    /** Filter by warranty health: VALID, EXPIRING_SOON, EXPIRED */
    private String warrantyStatus;
}
