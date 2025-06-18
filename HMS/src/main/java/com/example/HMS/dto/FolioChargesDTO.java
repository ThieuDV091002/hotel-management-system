package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FolioChargesDTO {
    private Long id;
    private Long folioId;
    private String chargeType;
    private String description;
    private String itemName;
    private int quantity;
    private double unitPrice;
    private double totalPrice;
    private LocalDateTime chargeTime;
}
