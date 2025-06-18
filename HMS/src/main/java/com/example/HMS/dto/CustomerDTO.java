package com.example.HMS.dto;

import com.example.HMS.model.LoyaltyLevel;
import com.example.HMS.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDTO {
    private Long id;
    private String fullName;
    private String username;
    private String password;
    private String email;
    private String phoneNumber;
    private boolean isActive;
    private Role role;
    private String address;
    private double loyaltyPoints;
    private Long loyaltyLevelId;
    private String loyaltyLevelName;
    private String loyaltyBenefits;
    private String loyaltyDescription;
}
