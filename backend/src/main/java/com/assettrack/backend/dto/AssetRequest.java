package com.assettrack.backend.dto;

import com.assettrack.backend.domain.AssetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Input DTO for creating or fully updating an asset.
 * Used by POST /api/assets and PUT /api/assets/{id}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetRequest {

    @NotNull(message = "Asset type is required")
    private AssetType type;

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Model is required")
    private String model;

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    @NotNull(message = "Purchase date is required")
    @PastOrPresent(message = "Purchase date cannot be in the future")
    private LocalDate purchaseDate;

    @NotNull(message = "Warranty expiration date is required")
    private LocalDate warrantyExpirationDate;

    /** Optional free-text notes about the asset condition. */
    private String notes;
}
