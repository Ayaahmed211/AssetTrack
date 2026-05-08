package com.assettrack.backend.dto;

import lombok.Data;

@Data
public class ReturnRequest {
    private Long assetId;
    private String notes;
}