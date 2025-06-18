package com.example.HMS.service;

import com.example.HMS.model.LoyaltyLevel;
import com.example.HMS.repository.LoyaltyLevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoyaltyLevelServiceImpl implements LoyaltyLevelService{
    private final LoyaltyLevelRepository loyaltyLevelRepository;

    @Override
    public List<LoyaltyLevel> getAllLoyaltyLevels() {
        return loyaltyLevelRepository.findAll();
    }

    @Override
    public LoyaltyLevel getLoyaltyLevelById(Long id) {
        return loyaltyLevelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loyalty level not found with id: " + id));
    }

    @Override
    public LoyaltyLevel createLoyaltyLevel(LoyaltyLevel loyaltyLevel) {
        return loyaltyLevelRepository.save(loyaltyLevel);
    }

    @Override
    public LoyaltyLevel updateLoyaltyLevel(Long id, LoyaltyLevel loyaltyLevel) {
        LoyaltyLevel existing = getLoyaltyLevelById(id);
        existing.setLevelName(loyaltyLevel.getLevelName());
        existing.setPointsRequired(loyaltyLevel.getPointsRequired());
        existing.setBenefits(loyaltyLevel.getBenefits());
        return loyaltyLevelRepository.save(existing);
    }

    @Override
    public void deleteLoyaltyLevel(Long id) {
        if (!loyaltyLevelRepository.existsById(id)) {
            throw new RuntimeException("Loyalty level not found with id: " + id);
        }
        loyaltyLevelRepository.deleteById(id);
    }
}
