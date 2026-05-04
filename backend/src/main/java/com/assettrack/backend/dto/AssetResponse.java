package com.assettrack.backend.dto;

import com.assettrack.backend.domain.AssetStatus;
import com.assettrack.backend.domain.AssetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Output DTO returned by all asset endpoints.
 *
 * Includes two computed warranty fields calculated in AssetService.mapToResponse():
 *  - warrantyStatus:          "VALID" | "EXPIRING_SOON" (≤30 days) | "EXPIRED"
 *  - daysUntilWarrantyExpiry: positive = days remaining, negative = days past expiry
 *
 * Member 4 integration note:
 *  When allocation is implemented, a `assignedToUser` field (UserDto) will be added here.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetResponse {

    private Long id;
    private AssetType type;
    private String brand;
    private String model;
    private String serialNumber;
    private LocalDate purchaseDate;
    private LocalDate warrantyExpirationDate;
    private AssetStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // --- Computed warranty fields ---

    /**
     * Human-readable warranty health:
     *   "EXPIRED"        — warrantyExpirationDate is in the past
     *   "EXPIRING_SOON"  — expires within the next 30 days
     *   "VALID"          — more than 30 days remaining
     */
    private String warrantyStatus;

    /**
     * Days between today and warrantyExpirationDate.
     * Negative value means the warranty has already expired.
     */
    private long daysUntilWarrantyExpiry;
}
