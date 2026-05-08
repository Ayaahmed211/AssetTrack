package com.assettrack.backend.repository;

import com.assettrack.backend.domain.AllocationHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllocationHistoryRepository extends JpaRepository<AllocationHistory, Long> {

    // Get full history of a specific asset (newest first)
    List<AllocationHistory> findByAssetIdOrderByAssignedAtDesc(Long assetId);

    // Get everything ever assigned to a specific user
    List<AllocationHistory> findByAssignedToIdOrderByAssignedAtDesc(Long userId);

    // Paginated version of full history — used by GET /api/allocations/history?page=0&size=20
    Page<AllocationHistory> findAllByOrderByAssignedAtDesc(Pageable pageable);
}