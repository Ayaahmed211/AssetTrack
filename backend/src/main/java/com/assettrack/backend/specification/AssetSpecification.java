package com.assettrack.backend.specification;

import com.assettrack.backend.domain.Asset;
import com.assettrack.backend.domain.AssetStatus;
import com.assettrack.backend.domain.AssetType;
import org.springframework.data.jpa.domain.Specification;

/**
 * JPA Specifications for dynamic, null-safe multi-field asset search.
 *
 * Each method returns null when the filter value is null/blank,
 * which Specification.where() and .and() treat as "no filter" (match all).
 *
 * This avoids the Hibernate enum null-binding bug present in JPQL
 * ':status IS NULL OR a.status = :status' queries.
 */
public class AssetSpecification {

    private AssetSpecification() {}  // utility class

    /** Case-insensitive partial match on serialNumber. */
    public static Specification<Asset> hasSerialNumber(String serialNumber) {
        if (serialNumber == null || serialNumber.isBlank()) return null;
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("serialNumber")),
                        "%" + serialNumber.trim().toLowerCase() + "%");
    }

    /** Case-insensitive partial match on brand. */
    public static Specification<Asset> hasBrand(String brand) {
        if (brand == null || brand.isBlank()) return null;
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("brand")),
                        "%" + brand.trim().toLowerCase() + "%");
    }

    /** Case-insensitive partial match on model. */
    public static Specification<Asset> hasModel(String model) {
        if (model == null || model.isBlank()) return null;
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("model")),
                        "%" + model.trim().toLowerCase() + "%");
    }

    /** Exact match on lifecycle status enum. */
    public static Specification<Asset> hasStatus(AssetStatus status) {
        if (status == null) return null;
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    /** Exact match on hardware type enum. */
    public static Specification<Asset> hasType(AssetType type) {
        if (type == null) return null;
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    /** Match on the assigned user's ID (FK lookup). */
    public static Specification<Asset> assignedToUser(Long userId) {
        if (userId == null) return null;
        return (root, query, cb) ->
                cb.equal(root.get("assignedTo").get("id"), userId);
    }
}
