package com.assettrack.backend.dto;

import lombok.Data;

@Data
public class ConditionReportRequest {
    private Long assetId;
    // Send one of: GOOD, FAIR, DAMAGED, UNDER_REPAIR, DECOMMISSIONED
    private String conditionStatus;
    private String description;
}