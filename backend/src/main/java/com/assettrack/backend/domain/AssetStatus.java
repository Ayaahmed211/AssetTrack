package com.assettrack.backend.domain;

/**
 * Lifecycle status of an asset.
 *
 * Transitions:
 *   AVAILABLE → ASSIGNED          (Member 4: allocation)
 *   ASSIGNED  → AVAILABLE         (Member 4: unassignment)
 *   ANY       → UNDER_MAINTENANCE (admin action)
 *   ANY       → DECOMMISSIONED    (admin action — terminal state)
 */
public enum AssetStatus {
    AVAILABLE,
    ASSIGNED,
    UNDER_MAINTENANCE,
    DECOMMISSIONED
}
