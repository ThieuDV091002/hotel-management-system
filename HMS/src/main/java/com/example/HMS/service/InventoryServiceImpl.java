package com.example.HMS.service;

import com.example.HMS.dto.InventoryDTO;
import com.example.HMS.model.Inventory;
import com.example.HMS.model.Supplier;
import com.example.HMS.repository.InventoryRepository;
import com.example.HMS.repository.SupplierRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {
    private final InventoryRepository inventoryRepository;
    private final SupplierRepository supplierRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<InventoryDTO> getInventories(String inventoryName, String supplierName, Pageable pageable) {
        Page<Inventory> inventories = inventoryRepository.searchInventories(inventoryName, supplierName, pageable);
        return inventories.map(inventory -> modelMapper.map(inventory, InventoryDTO.class));
    }

    @Override
    public InventoryDTO getInventoryById(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));
        return modelMapper.map(inventory, InventoryDTO.class);
    }

    @Override
    @Transactional
    public InventoryDTO createInventory(InventoryDTO inventoryDTO) {
        Inventory inventory = new Inventory();

        Supplier supplier = supplierRepository.findBySupplierName(inventoryDTO.getSupplierName())
                .orElseThrow(() -> new RuntimeException("Supplier not found with name: " + inventoryDTO.getSupplierName()));

        inventory.setSupplier(supplier);
        inventory.setInventoryName(inventoryDTO.getInventoryName());
        inventory.setInventoryPrice(inventoryDTO.getInventoryPrice());
        inventory.setInventoryQuantity(inventoryDTO.getInventoryQuantity());
        Inventory savedInventory = inventoryRepository.save(inventory);
        return modelMapper.map(savedInventory, InventoryDTO.class);
    }

    @Override
    @Transactional
    public InventoryDTO updateInventory(Long id, InventoryDTO inventoryDTO) {
        Inventory existingInventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        existingInventory.setInventoryName(inventoryDTO.getInventoryName());
        existingInventory.setInventoryPrice(inventoryDTO.getInventoryPrice());
        existingInventory.setInventoryQuantity(inventoryDTO.getInventoryQuantity());
        Supplier supplier = supplierRepository.findBySupplierName(inventoryDTO.getSupplierName())
                .orElseThrow(() -> new RuntimeException("Supplier not found with name: " + inventoryDTO.getSupplierName()));
        existingInventory.setSupplier(supplier);

        Inventory updatedInventory = inventoryRepository.save(existingInventory);
        return modelMapper.map(updatedInventory, InventoryDTO.class);
    }

    @Override
    @Transactional
    public void deleteInventory(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));
        inventoryRepository.delete(inventory);
    }

    @Override
    @Transactional
    public InventoryDTO updateInventoryQuantity(Long id, int quantity) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));
        if (quantity < 0) {
            throw new RuntimeException("Quantity cannot be negative");
        }
        inventory.setInventoryQuantity(quantity);
        Inventory updatedInventory = inventoryRepository.save(inventory);
        return modelMapper.map(updatedInventory, InventoryDTO.class);
    }
    @Override
    public List<InventoryDTO> getInventoriesBySupplierId(Long supplierId) {
        List<Inventory> inventories = inventoryRepository.findBySupplierId(supplierId);
        return inventories.stream()
                .map(inventory -> modelMapper.map(inventory, InventoryDTO.class))
                .collect(Collectors.toList());
    }

}
