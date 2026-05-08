package com.assettrack.backend.dto;

import lombok.Data;

@Data
public class AllocationRequest {
    private Long assetId;
    private Long assignedToUserId;
    private String notes;
}