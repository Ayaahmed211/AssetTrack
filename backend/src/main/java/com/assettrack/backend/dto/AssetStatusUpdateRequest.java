package com.assettrack.backend.dto;

import com.assettrack.backend.domain.AssetStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Input DTO for the PATCH /api/assets/{id}/status endpoint.
 * Allows updating only the status field without touching other asset data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private AssetStatus status;
}
