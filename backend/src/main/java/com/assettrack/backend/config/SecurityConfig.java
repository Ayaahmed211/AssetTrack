package com.assettrack.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Configures BCrypt as the password encoder.
     * This fulfills the requirement that passwords must never be stored in plain text.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Exposes the AuthenticationManager as a Bean.
     * This will be used later in the AuthController to authenticate login credentials.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Configures the main security filter chain.
     * Disables CSRF, sets session management to stateless, and configures endpoint authorization rules.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF since we are building a stateless REST API using JWT
                .csrf(AbstractHttpConfigurer::disable)

                // Set session creation policy to STATELESS as JWTs will handle user sessions
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Configure endpoint access rules
                .authorizeHttpRequests(auth -> auth
                        // Allow unauthenticated access to the signup and login APIs
                        .requestMatchers("/api/auth/**").permitAll()
                        // All other endpoints in the application require a valid JWT (authentication)
                        .anyRequest().authenticated()
                );


        return http.build();
    }
}