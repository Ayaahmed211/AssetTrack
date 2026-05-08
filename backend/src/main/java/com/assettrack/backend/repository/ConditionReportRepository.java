package com.assettrack.backend.repository;

import com.assettrack.backend.domain.ConditionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConditionReportRepository extends JpaRepository<ConditionReport, Long> {

    // All condition reports for one asset (newest first)
    List<ConditionReport> findByAssetIdOrderByReportedAtDesc(Long assetId);
}