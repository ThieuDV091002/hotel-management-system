package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDTO {
    private Long id;
    private String inventoryName;
    private double inventoryPrice;
    private int inventoryQuantity;
    private Long supplierId;
    private String supplierName;
}
