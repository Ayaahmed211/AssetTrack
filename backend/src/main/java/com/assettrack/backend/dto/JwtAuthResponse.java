package com.assettrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for sending the JWT access token back to the client after successful authentication.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtAuthResponse {

    private String accessToken;
    private String tokenType = "Bearer";

    // Custom constructor to easily instantiate with just the token
    public JwtAuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }
}