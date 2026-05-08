package com.assettrack.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "condition_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConditionReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    @JsonIgnoreProperties({"assignedTo", "hibernateLazyInitializer"})
    private Asset asset;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reported_by_id")
    @JsonIgnoreProperties({"password", "authorities", "accountNonExpired",
            "accountNonLocked", "credentialsNonExpired", "hibernateLazyInitializer"})
    private User reportedBy;

    @Column(name = "condition_status", nullable = false)
    private String conditionStatus;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "reported_at", nullable = false)
    private LocalDateTime reportedAt;
}