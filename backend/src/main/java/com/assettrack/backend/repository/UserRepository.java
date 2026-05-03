package com.assettrack.backend.repository;

import com.assettrack.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(com.assettrack.backend.domain.Role role);
    boolean existsByEmail(String email);
}