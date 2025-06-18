package com.example.HMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@DiscriminatorValue("CUSTOMER")
@NoArgsConstructor
@AllArgsConstructor
@Data
@SuperBuilder
public class Customer extends User {
    private String address;
    private double loyaltyPoints;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loyalty_level_id")
    private LoyaltyLevel loyaltyLevel;
}
