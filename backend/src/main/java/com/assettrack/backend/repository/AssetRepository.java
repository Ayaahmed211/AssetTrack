package com.assettrack.backend.repository;

import com.assettrack.backend.domain.Asset;
import com.assettrack.backend.domain.AssetStatus;
import com.assettrack.backend.domain.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Asset persistence operations.
 *
 * Member 5 integration note:
 *  findByWarrantyExpirationDateBefore() and findByWarrantyExpirationDateBetween()
 *  are used by the warranty expiration scheduler to detect expired/expiring-soon assets.
 */
@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    /** Find a single asset by its unique serial number. */
    Optional<Asset> findBySerialNumber(String serialNumber);

    /** Guard against duplicate serial numbers before saving. */
    boolean existsBySerialNumber(String serialNumber);

    /** Filter all assets by their current lifecycle status. */
    List<Asset> findByStatus(AssetStatus status);

    /** Filter all assets by hardware category. */
    List<Asset> findByType(AssetType type);

    /**
     * Used for expired warranty detection.
     * Returns assets whose warranty expired before the given date (typically LocalDate.now()).
     */
    List<Asset> findByWarrantyExpirationDateBefore(LocalDate date);

    /**
     * Used for "expiring soon" detection.
     * Returns assets whose warranty falls within the given date range
     * (typically today → today + 30 days).
     */
    List<Asset> findByWarrantyExpirationDateBetween(LocalDate start, LocalDate end);

    /**
     * Used for spare laptop logic.
     * Returns AVAILABLE assets of a specific type (e.g. LAPTOP + AVAILABLE).
     */
    List<Asset> findByTypeAndStatus(AssetType type, AssetStatus status);
}
