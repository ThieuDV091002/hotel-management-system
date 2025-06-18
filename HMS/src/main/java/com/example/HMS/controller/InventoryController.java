package com.example.HMS.controller;

import com.example.HMS.dto.InventoryDTO;
import com.example.HMS.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventories")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<Page<InventoryDTO>> getInventories(
            @RequestParam(required = false) String inventoryName,
            @RequestParam(required = false) String supplierName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryDTO> inventories = inventoryService.getInventories(inventoryName, supplierName, pageable);
        return ResponseEntity.ok(inventories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryDTO> getInventoryById(@PathVariable Long id) {
        InventoryDTO inventory = inventoryService.getInventoryById(id);
        return ResponseEntity.ok(inventory);
    }

    @PostMapping
    public ResponseEntity<InventoryDTO> createInventory(@RequestBody InventoryDTO inventoryDTO) {
        InventoryDTO createdInventory = inventoryService.createInventory(inventoryDTO);
        return ResponseEntity.ok(createdInventory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryDTO> updateInventory(@PathVariable Long id, @RequestBody InventoryDTO inventoryDTO) {
        InventoryDTO updatedInventory = inventoryService.updateInventory(id, inventoryDTO);
        return ResponseEntity.ok(updatedInventory);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/quantity")
    public ResponseEntity<InventoryDTO> updateInventoryQuantity(@PathVariable Long id, @RequestParam int quantity) {
        InventoryDTO updatedInventory = inventoryService.updateInventoryQuantity(id, quantity);
        return ResponseEntity.ok(updatedInventory);
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<InventoryDTO>> getInventoriesBySupplierId(@PathVariable Long supplierId) {
        List<InventoryDTO> inventories = inventoryService.getInventoriesBySupplierId(supplierId);
        return ResponseEntity.ok(inventories);
    }

}
