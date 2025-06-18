package com.example.HMS.service;

import com.example.HMS.dto.InventoryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InventoryService {
    Page<InventoryDTO> getInventories(String inventoryName, String supplierName, Pageable pageable);
    InventoryDTO getInventoryById(Long id);
    InventoryDTO createInventory(InventoryDTO inventoryDTO);
    InventoryDTO updateInventory(Long id, InventoryDTO inventoryDTO);
    void deleteInventory(Long id);
    InventoryDTO updateInventoryQuantity(Long id, int quantity);
    List<InventoryDTO> getInventoriesBySupplierId(Long supplierId);
}
