package com.example.HMS.controller;

import com.example.HMS.dto.InventoryReceiptDTO;
import com.example.HMS.service.InventoryReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inventory-receipts")
public class InventoryReceiptController {
    private final InventoryReceiptService inventoryReceiptService;

    @GetMapping
    public ResponseEntity<Page<InventoryReceiptDTO>> getInventoryReceipts(
            @RequestParam(required = false) String receiptCode,
            @RequestParam(required = false) String supplierName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryReceiptDTO> receipts = inventoryReceiptService.getInventoryReceipts(receiptCode, supplierName, pageable);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryReceiptDTO> getInventoryReceiptById(@PathVariable Long id) {
        InventoryReceiptDTO receipt = inventoryReceiptService.getInventoryReceiptById(id);
        return ResponseEntity.ok(receipt);
    }

    @PostMapping
    public ResponseEntity<InventoryReceiptDTO> createInventoryReceipt(@RequestBody InventoryReceiptDTO receiptDTO) {
        InventoryReceiptDTO createdReceipt = inventoryReceiptService.createInventoryReceipt(receiptDTO);
        return ResponseEntity.ok(createdReceipt);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryReceiptDTO> updateInventoryReceipt(@PathVariable Long id, @RequestBody InventoryReceiptDTO receiptDTO) {
        InventoryReceiptDTO updatedReceipt = inventoryReceiptService.updateInventoryReceipt(id, receiptDTO);
        return ResponseEntity.ok(updatedReceipt);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventoryReceipt(@PathVariable Long id) {
        inventoryReceiptService.deleteInventoryReceipt(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InventoryReceiptDTO> updateReceiptStatus(@PathVariable Long id, @RequestParam String status) {
        InventoryReceiptDTO updatedReceipt = inventoryReceiptService.updateReceiptStatus(id, status);
        return ResponseEntity.ok(updatedReceipt);
    }
}
