package com.example.HMS.controller;

import com.example.HMS.model.LoyaltyLevel;
import com.example.HMS.service.LoyaltyLevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loyalty-levels")
@RequiredArgsConstructor
public class LoyaltyLevelController {

    private final LoyaltyLevelService loyaltyLevelService;

    @GetMapping
    public List<LoyaltyLevel> getAllLoyaltyLevels(@AuthenticationPrincipal UserDetails userDetails) {
        return loyaltyLevelService.getAllLoyaltyLevels();
    }

    @GetMapping("/{id}")
    public LoyaltyLevel getLoyaltyLevelById(@PathVariable Long id) {
        return loyaltyLevelService.getLoyaltyLevelById(id);
    }

    @PostMapping
    public LoyaltyLevel createLoyaltyLevel(@RequestBody LoyaltyLevel loyaltyLevel) {
        return loyaltyLevelService.createLoyaltyLevel(loyaltyLevel);
    }

    @PutMapping("/{id}")
    public LoyaltyLevel updateLoyaltyLevel(@PathVariable Long id, @RequestBody LoyaltyLevel loyaltyLevel) {
        return loyaltyLevelService.updateLoyaltyLevel(id, loyaltyLevel);
    }

    @DeleteMapping("/{id}")
    public void deleteLoyaltyLevel(@PathVariable Long id) {
        loyaltyLevelService.deleteLoyaltyLevel(id);
    }
}
