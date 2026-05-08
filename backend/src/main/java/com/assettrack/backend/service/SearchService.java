package com.assettrack.backend.service;

import com.assettrack.backend.domain.Asset;
import com.assettrack.backend.dto.AssetResponse;
import com.assettrack.backend.dto.AssetSearchRequest;
import com.assettrack.backend.repository.AssetRepository;
import com.assettrack.backend.specification.AssetSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for advanced multi-field asset search using JPA Specifications.
 *
 * Builds a list of non-null predicates then combines them with AND.
 * Each filter is independently optional — null = "match any".
 * warrantyStatus (VALID/EXPIRING_SOON/EXPIRED) is computed post-DB.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final AssetRepository assetRepository;
    private final AssetService assetService;

    @Transactional(readOnly = true)
    public List<AssetResponse> search(AssetSearchRequest req) {

        // Collect only non-null Specifications into a list
        List<Specification<Asset>> predicates = new ArrayList<>();

        Specification<Asset> bySerial = AssetSpecification.hasSerialNumber(req.getSerialNumber());
        Specification<Asset> byBrand  = AssetSpecification.hasBrand(req.getBrand());
        Specification<Asset> byModel  = AssetSpecification.hasModel(req.getModel());
        Specification<Asset> byStatus = AssetSpecification.hasStatus(req.getStatus());
        Specification<Asset> byType   = AssetSpecification.hasType(req.getType());
        Specification<Asset> byUser   = AssetSpecification.assignedToUser(req.getAssignedUserId());

        if (bySerial != null) predicates.add(bySerial);
        if (byBrand  != null) predicates.add(byBrand);
        if (byModel  != null) predicates.add(byModel);
        if (byStatus != null) predicates.add(byStatus);
        if (byType   != null) predicates.add(byType);
        if (byUser   != null) predicates.add(byUser);

        // Combine all predicates with AND, or match everything if none provided
        Specification<Asset> finalSpec;
        if (predicates.isEmpty()) {
            // No filters — return all assets
            finalSpec = (root, query, cb) -> cb.conjunction(); // WHERE 1=1
        } else {
            finalSpec = predicates.get(0);
            for (int i = 1; i < predicates.size(); i++) {
                finalSpec = finalSpec.and(predicates.get(i));
            }
        }

        // Query DB and map to response DTOs
        List<AssetResponse> results = assetRepository.findAll(finalSpec)
                .stream()
                .map(assetService::mapToResponse)
                .collect(Collectors.toList());

        log.info("[SearchService] Query returned {} assets before warrantyStatus filter", results.size());

        // Apply optional warrantyStatus filter in-memory
        if (req.getWarrantyStatus() != null && !req.getWarrantyStatus().isBlank()) {
            String ws = req.getWarrantyStatus().toUpperCase().trim();
            results = results.stream()
                    .filter(r -> ws.equals(r.getWarrantyStatus()))
                    .collect(Collectors.toList());
            log.info("[SearchService] After warrantyStatus='{}' filter: {} assets", ws, results.size());
        }

        return results;
    }
}
