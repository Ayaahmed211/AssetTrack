package com.assettrack.backend.controller;

import com.assettrack.backend.dto.JwtAuthResponse;
import com.assettrack.backend.dto.LoginRequest;
import com.assettrack.backend.dto.SignupRequest;
import com.assettrack.backend.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for handling user authentication (Signup and Login).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    // Constructor Injection
    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * API Endpoint for User Login.
     * Expects a valid email and password. Returns a JWT access token.
     */
    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {

        // 1. Authenticate the user credentials
        // Note: This will throw an exception until Member 2 implements the UserDetailsService and Database Repository.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // 2. If authentication is successful, retrieve the user details
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // 3. Generate the JWT token for the user
        String token = jwtService.generateToken(userDetails);

        // 4. Return the token in the response body
        return ResponseEntity.ok(new JwtAuthResponse(token));
    }

    /**
     * API Endpoint for User Signup.
     * Expects a valid name, email, and password.
     */
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody SignupRequest signupRequest) {

        // 1. Hash the plain-text password using BCrypt
        String hashedPassword = passwordEncoder.encode(signupRequest.getPassword());

        /*
         * =========================================================
         * TODO FOR MEMBER 2 (User Roles & User Management):
         * =========================================================
         * 1. Check if the email already exists in the UserRepository.
         * 2. Create a new User entity object.
         * 3. Set the User's name, email, and the 'hashedPassword'.
         * 4. Assign a default role (e.g., DEVELOPER).
         * 5. Save the User entity to the database using UserRepository.
         * 6. Change this return statement to return a proper success message or the saved User DTO.
         * =========================================================
         */

        // 2. Temporary response until Member 2 completes their integration
        String responseMessage = String.format(
                "Signup API reached successfully!%nEmail: %s%nOriginal Password: %s%nHashed Password: %s%nWaiting for Member 2 to integrate UserRepository.",
                signupRequest.getEmail(),
                signupRequest.getPassword(),
                hashedPassword
        );

        return ResponseEntity.ok(responseMessage);
    }
}