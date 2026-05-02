package com.assettrack.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class ApplicationConfig {

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException("To be implemented later");
        };
    }

    /**
     * Configures the AuthenticationProvider which acts as the core engine to verify user credentials.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        // Pass the userDetailsService directly into the constructor to resolve the compilation error
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());

        // Set the password encoder to BCrypt
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    /**
     * Exposes the AuthenticationManager as a Bean to be used in the AuthController.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Configures BCrypt as the password encoder.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}