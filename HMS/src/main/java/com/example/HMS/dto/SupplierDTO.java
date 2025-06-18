package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDTO {
    private Long id;
    private String supplierName;
    private String supplierAddress;
    private String supplierPhone;
    private List<InventoryItemDTO> inventoryItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryItemDTO {
        private Long id;
        private String name;
    }
}
