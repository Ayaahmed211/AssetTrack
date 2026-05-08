package com.assettrack.backend.controller;

import com.assettrack.backend.domain.AllocationHistory;
import com.assettrack.backend.domain.ConditionReport;
import com.assettrack.backend.dto.AllocationRequest;
import com.assettrack.backend.dto.ConditionReportRequest;
import com.assettrack.backend.dto.ReturnRequest;
import com.assettrack.backend.service.AllocationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allocations")
public class AllocationController {

    private final AllocationService allocationService;

    public AllocationController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    // ── Assign ──────────────────────────────────────────────────────────────
    @PostMapping("/assign")
    public ResponseEntity<AllocationHistory> assign(@RequestBody AllocationRequest request) {
        return ResponseEntity.ok(allocationService.assignAsset(request));
    }

    // ── Transfer ─────────────────────────────────────────────────────────────
    @PostMapping("/transfer")
    public ResponseEntity<AllocationHistory> transfer(@RequestBody AllocationRequest request) {
        return ResponseEntity.ok(allocationService.transferAsset(request));
    }

    // ── Return ───────────────────────────────────────────────────────────────
    @PostMapping("/return")
    public ResponseEntity<AllocationHistory> returnAsset(@RequestBody ReturnRequest request) {
        return ResponseEntity.ok(allocationService.returnAsset(request));
    }

    // ── History: by asset ────────────────────────────────────────────────────
    @GetMapping("/history/asset/{assetId}")
    public ResponseEntity<List<AllocationHistory>> historyByAsset(@PathVariable Long assetId) {
        return ResponseEntity.ok(allocationService.getHistoryByAsset(assetId));
    }

    // ── History: by user ─────────────────────────────────────────────────────
    @GetMapping("/history/user/{userId}")
    public ResponseEntity<List<AllocationHistory>> historyByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(allocationService.getHistoryByUser(userId));
    }

    // ── History: all (non-paginated — returns every record) ───────────────────
    @GetMapping("/history")
    public ResponseEntity<List<AllocationHistory>> allHistory() {
        return ResponseEntity.ok(allocationService.getAllHistory());
    }

    // ── History: all (paginated) ──────────────────────────────────────────────
    //
    // Usage: GET /api/allocations/history/paged?page=0&size=20
    // Returns a Page<AllocationHistory> with totalElements, totalPages, etc.
    // Default: page 0, 20 records per page, sorted by assignedAt DESC.
    @GetMapping("/history/paged")
    public ResponseEntity<Page<AllocationHistory>> allHistoryPaged(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "assignedAt"));
        return ResponseEntity.ok(allocationService.getAllHistoryPaged(pageable));
    }

    // ── Condition report: create ─────────────────────────────────────────────
    @PostMapping("/condition-report")
    public ResponseEntity<ConditionReport> createReport(@RequestBody ConditionReportRequest req) {
        return ResponseEntity.ok(allocationService.createConditionReport(req));
    }

    // ── Condition report: by asset ───────────────────────────────────────────
    @GetMapping("/condition-report/asset/{assetId}")
    public ResponseEntity<List<ConditionReport>> reportsByAsset(@PathVariable Long assetId) {
        return ResponseEntity.ok(allocationService.getReportsByAsset(assetId));
    }

    // ── Condition report: all ────────────────────────────────────────────────
    @GetMapping("/condition-report/all")
    public ResponseEntity<List<ConditionReport>> allReports() {
        return ResponseEntity.ok(allocationService.getAllConditionReports());
    }

    // ── Condition report: my reports ─────────────────────────────────────────
    @GetMapping("/condition-report/my")
    public ResponseEntity<List<ConditionReport>> myReports() {
        return ResponseEntity.ok(allocationService.getMyConditionReports());
    }
}