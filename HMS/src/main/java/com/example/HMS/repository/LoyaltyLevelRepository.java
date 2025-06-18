package com.example.HMS.repository;

import com.example.HMS.model.LoyaltyLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LoyaltyLevelRepository extends JpaRepository<LoyaltyLevel, Long> {
    @Query("SELECT l FROM LoyaltyLevel l WHERE l.pointsRequired <= :points ORDER BY l.pointsRequired DESC LIMIT 1")
    Optional<LoyaltyLevel> findHighestLevelForPoints(@Param("points") double points);
}
