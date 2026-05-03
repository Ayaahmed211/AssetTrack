package com.assettrack.backend.dto;

import com.assettrack.backend.domain.Role;
import lombok.Data;

@Data
public class UpdateRoleRequest {
    private Role role;
}