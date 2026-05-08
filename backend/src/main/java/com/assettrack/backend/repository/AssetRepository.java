package com.assettrack.backend.repository;

import com.assettrack.backend.domain.Asset;
import com.assettrack.backend.domain.AssetStatus;
import com.assettrack.backend.domain.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Asset persistence operations.
 *
 * Member 5 integration notes:
 *  - findByWarrantyExpirationDateBefore / Between  → WarrantyScheduler
 *  - countBy*                                      → DashboardService
 *  - JpaSpecificationExecutor<Asset>               → SearchService (Specification-based multi-field search)
 */
@Repository
public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {

    Optional<Asset> findBySerialNumber(String serialNumber);
    boolean existsBySerialNumber(String serialNumber);
    List<Asset> findByStatus(AssetStatus status);
    List<Asset> findByType(AssetType type);
    List<Asset> findByWarrantyExpirationDateBefore(LocalDate date);
    List<Asset> findByWarrantyExpirationDateBetween(LocalDate start, LocalDate end);
    List<Asset> findByTypeAndStatus(AssetType type, AssetStatus status);

    // ── Dashboard count methods ───────────────────────────────────────────────
    long countByStatus(AssetStatus status);
    long countByType(AssetType type);
    long countByWarrantyExpirationDateBefore(LocalDate date);
    long countByWarrantyExpirationDateBetween(LocalDate start, LocalDate end);
    long countByTypeAndStatus(AssetType type, AssetStatus status);
    // Dynamic multi-field search via JpaSpecificationExecutor → AssetSpecification + SearchService
}
