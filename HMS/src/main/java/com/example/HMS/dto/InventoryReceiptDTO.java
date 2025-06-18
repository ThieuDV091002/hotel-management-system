package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReceiptDTO {
    private Long id;
    private String receiptCode;
    private LocalDateTime receiptDate;
    private Long supplierId;
    private String supplierName;
    private String status;
    private double totalAmount;
    private List<InventoryReceiptDetailDTO> details = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryReceiptDetailDTO {
        private Long id;
        private Long inventoryId;
        private String inventoryName;
        private int quantity;
        private double unitPrice;
    }
}
