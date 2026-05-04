package com.assettrack.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "allocation_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    @JsonIgnoreProperties({"assignedTo", "hibernateLazyInitializer"})
    private Asset asset;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to_id")
    @JsonIgnoreProperties({"password", "authorities", "accountNonExpired",
            "accountNonLocked", "credentialsNonExpired", "hibernateLazyInitializer"})
    private User assignedTo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_from_id")
    @JsonIgnoreProperties({"password", "authorities", "accountNonExpired",
            "accountNonLocked", "credentialsNonExpired", "hibernateLazyInitializer"})
    private User assignedFrom;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_by_id")
    @JsonIgnoreProperties({"password", "authorities", "accountNonExpired",
            "accountNonLocked", "credentialsNonExpired", "hibernateLazyInitializer"})
    private User assignedBy;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(name = "notes")
    private String notes;
}