package com.example.HMS.repository;

import com.example.HMS.model.AccessToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccessTokenRepository extends JpaRepository<AccessToken, Long> {
    Optional<AccessToken> findByTokenAndRequestIdAndRequestType(String token, Long requestId, String requestType);
}
