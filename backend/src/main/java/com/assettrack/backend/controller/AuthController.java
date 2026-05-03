package com.assettrack.backend.controller;

import com.assettrack.backend.domain.Role;
import com.assettrack.backend.domain.User;
import com.assettrack.backend.dto.JwtAuthResponse;
import com.assettrack.backend.dto.LoginRequest;
import com.assettrack.backend.dto.SignupRequest;
import com.assettrack.backend.repository.UserRepository;
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
 * Member 2 completed the signup integration with UserRepository.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          PasswordEncoder passwordEncoder,
                          UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    /**
     * API Endpoint for User Login.
     * Expects a valid email and password. Returns a JWT access token.
     */
    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {

        // 1. Authenticate the user credentials
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
     * Completed by Member 2 - saves user to database with hashed password.
     */
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody SignupRequest signupRequest) {

        // 1. Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists!");
        }

        // 2. Hash the plain-text password using BCrypt
        String hashedPassword = passwordEncoder.encode(signupRequest.getPassword());

        // 3. Create a new User entity
        User newUser = User.builder()
                .fullName(signupRequest.getName())
                .email(signupRequest.getEmail())
                .password(hashedPassword)
                .role(Role.DEVELOPER)
                .enabled(true)
                .build();

        // 4. Save the user to the database
        userRepository.save(newUser);

        // 5. Return success message
        return ResponseEntity.ok("User registered successfully!");
    }
}