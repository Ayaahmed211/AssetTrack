package com.assettrack.backend.controller;

import com.assettrack.backend.domain.AllocationHistory;
import com.assettrack.backend.domain.ConditionReport;
import com.assettrack.backend.dto.AllocationRequest;
import com.assettrack.backend.dto.ConditionReportRequest;
import com.assettrack.backend.dto.ReturnRequest;
import com.assettrack.backend.service.AllocationService;
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

    // ── History: all ─────────────────────────────────────────────────────────
    @GetMapping("/history")
    public ResponseEntity<List<AllocationHistory>> allHistory() {
        return ResponseEntity.ok(allocationService.getAllHistory());
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
}