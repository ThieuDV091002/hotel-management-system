package com.example.HMS.service;

import com.example.HMS.model.LoyaltyLevel;

import java.util.List;

public interface LoyaltyLevelService {
    List<LoyaltyLevel> getAllLoyaltyLevels();
    LoyaltyLevel getLoyaltyLevelById(Long id);
    LoyaltyLevel createLoyaltyLevel(LoyaltyLevel loyaltyLevel);
    LoyaltyLevel updateLoyaltyLevel(Long id, LoyaltyLevel loyaltyLevel);
    void deleteLoyaltyLevel(Long id);
}
