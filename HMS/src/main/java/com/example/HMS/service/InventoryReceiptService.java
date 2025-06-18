package com.example.HMS.service;

import com.example.HMS.dto.InventoryReceiptDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InventoryReceiptService {
    Page<InventoryReceiptDTO> getInventoryReceipts(String receiptCode, String supplierName, Pageable pageable);
    InventoryReceiptDTO getInventoryReceiptById(Long id);
    InventoryReceiptDTO createInventoryReceipt(InventoryReceiptDTO receiptDTO);
    InventoryReceiptDTO updateInventoryReceipt(Long id, InventoryReceiptDTO receiptDTO);
    void deleteInventoryReceipt(Long id);
    InventoryReceiptDTO updateReceiptStatus(Long id, String status);
}
