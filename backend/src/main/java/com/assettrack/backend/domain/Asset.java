package com.assettrack.backend.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA entity representing a hardware asset (laptop, monitor, or accessory).
 *
 * Schema notes:
 *  - serial_number has a UNIQUE constraint to prevent duplicates.
 *  - status defaults to AVAILABLE on creation.
 *  - createdAt / updatedAt are managed automatically via JPA lifecycle hooks.
 *
 * Integration notes:
 *  - Member 4 will add an `assignedTo` ManyToOne(User) field here for allocation.
 *  - Member 5's scheduler will query by warrantyExpirationDate using AssetRepository.
 */
@Entity
@Table(name = "assets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType type;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false, unique = true)
    private String serialNumber;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Column(nullable = false)
    private LocalDate warrantyExpirationDate;

    /**
     * Current lifecycle state of the asset.
     * Defaults to AVAILABLE when a new asset is registered.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AssetStatus status = AssetStatus.AVAILABLE;

    /**
     * Optional free-text field for condition notes or issues
     * reported by the assigned developer (used by Member 4's condition reports).
     */
    @Column(columnDefinition = "TEXT")
    private String notes;

    /** Set automatically when the record is first persisted. */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Updated automatically whenever the record changes. */
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
