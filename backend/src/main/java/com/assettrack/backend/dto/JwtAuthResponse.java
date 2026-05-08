package com.assettrack.backend.dto;

import com.assettrack.backend.domain.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for sending the JWT access token and user details back to the client.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtAuthResponse {

    private String accessToken;
    private String tokenType = "Bearer";
    
    // Additional fields for frontend RBAC
    private Long id;
    private String email;
    private String fullName;
    private Role role;

    public JwtAuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }
}