package com.example.HMS.service;

import com.example.HMS.dto.InventoryReceiptDTO;
import com.example.HMS.model.Inventory;
import com.example.HMS.model.InventoryReceipt;
import com.example.HMS.model.InventoryReceiptDetail;
import com.example.HMS.repository.InventoryReceiptRepository;
import com.example.HMS.repository.InventoryRepository;
import com.example.HMS.repository.SupplierRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryReceiptServiceImpl implements InventoryReceiptService {
    private final InventoryReceiptRepository inventoryReceiptRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<InventoryReceiptDTO> getInventoryReceipts(String receiptCode, String supplierName, Pageable pageable) {
        Page<InventoryReceipt> receipts = inventoryReceiptRepository
                .searchInventoryReceipts(receiptCode, supplierName, pageable);
        return receipts.map(receipt -> modelMapper.map(receipt, InventoryReceiptDTO.class));
    }


    @Override
    public InventoryReceiptDTO getInventoryReceiptById(Long id) {
        InventoryReceipt receipt = inventoryReceiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory receipt not found"));
        return modelMapper.map(receipt, InventoryReceiptDTO.class);
    }

    @Override
    @Transactional
    public InventoryReceiptDTO createInventoryReceipt(InventoryReceiptDTO receiptDTO) {
        InventoryReceipt receipt = new InventoryReceipt();
        receipt.setSupplier(supplierRepository.findById(receiptDTO.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found")));
        receipt.setStatus(receiptDTO.getStatus() != null ? receiptDTO.getStatus() : "PENDING");
        receipt.setReceiptCode(receiptDTO.getReceiptCode());
        receipt.setReceiptDate(receiptDTO.getReceiptDate() != null ? receiptDTO.getReceiptDate() : LocalDateTime.now());

        List<InventoryReceiptDetail> details = receiptDTO.getDetails().stream().map(detailDTO -> {
            InventoryReceiptDetail detail = new InventoryReceiptDetail();
            detail.setReceipt(receipt);
            Inventory inventory = inventoryRepository.findById(detailDTO.getInventoryId())
                    .orElseThrow(() -> new RuntimeException("Inventory not found"));
            detail.setInventory(inventory);
            detail.setQuantity(detailDTO.getQuantity());
            detail.setUnitPrice(inventory.getInventoryPrice());
            return detail;
        }).collect(Collectors.toList());

        receipt.setDetails(details);
        double totalAmount = details.stream()
                .mapToDouble(detail -> detail.getUnitPrice() * detail.getQuantity())
                .sum();

        receipt.setTotalAmount(totalAmount);

        InventoryReceipt savedReceipt = inventoryReceiptRepository.save(receipt);

        updateInventoryQuantities(details, true);

        return modelMapper.map(savedReceipt, InventoryReceiptDTO.class);
    }

    @Override
    @Transactional
    public InventoryReceiptDTO updateInventoryReceipt(Long id, InventoryReceiptDTO receiptDTO) {
        InventoryReceipt existingReceipt = inventoryReceiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory receipt not found"));

        List<InventoryReceiptDetail> oldDetails = existingReceipt.getDetails();

        existingReceipt.setSupplier(supplierRepository.findById(receiptDTO.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found")));
        existingReceipt.setStatus(receiptDTO.getStatus());
        existingReceipt.setReceiptCode(receiptDTO.getReceiptCode());
        existingReceipt.setReceiptDate(receiptDTO.getReceiptDate() != null ? receiptDTO.getReceiptDate() : LocalDateTime.now());

        existingReceipt.getDetails().clear();

        List<InventoryReceiptDetail> newDetails = receiptDTO.getDetails().stream().map(detailDTO -> {
            InventoryReceiptDetail detail = new InventoryReceiptDetail();
            detail.setReceipt(existingReceipt);
            Inventory inventory = inventoryRepository.findById(detailDTO.getInventoryId())
                    .orElseThrow(() -> new RuntimeException("Inventory not found"));
            detail.setInventory(inventory);
            detail.setQuantity(detailDTO.getQuantity());
            detail.setUnitPrice(inventory.getInventoryPrice());
            return detail;
        }).collect(Collectors.toList());

        existingReceipt.getDetails().addAll(newDetails);
        double totalAmount = newDetails.stream()
                .mapToDouble(detail -> detail.getUnitPrice() * detail.getQuantity())
                .sum();

        existingReceipt.setTotalAmount(totalAmount);

        InventoryReceipt updatedReceipt = inventoryReceiptRepository.save(existingReceipt);

        updateInventoryQuantities(oldDetails, false);
        updateInventoryQuantities(newDetails, true);

        return modelMapper.map(updatedReceipt, InventoryReceiptDTO.class);
    }

    @Override
    @Transactional
    public void deleteInventoryReceipt(Long id) {
        InventoryReceipt receipt = inventoryReceiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory receipt not found"));

        updateInventoryQuantities(receipt.getDetails(), false);

        inventoryReceiptRepository.delete(receipt);
    }

    @Override
    @Transactional
    public InventoryReceiptDTO updateReceiptStatus(Long id, String status) {
        InventoryReceipt receipt = inventoryReceiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory receipt not found"));
        receipt.setStatus(status);
        InventoryReceipt updatedReceipt = inventoryReceiptRepository.save(receipt);
        return modelMapper.map(updatedReceipt, InventoryReceiptDTO.class);
    }

    private void updateInventoryQuantities(List<InventoryReceiptDetail> details, boolean isAdd) {
        for (InventoryReceiptDetail detail : details) {
            Inventory inventory = detail.getInventory();
            int currentQuantity = inventory.getInventoryQuantity();
            int adjustment = isAdd ? detail.getQuantity() : -detail.getQuantity();
            if (currentQuantity + adjustment < 0) {
                throw new RuntimeException("Insufficient inventory quantity for " + inventory.getInventoryName());
            }
            inventory.setInventoryQuantity(currentQuantity + adjustment);
            inventoryRepository.save(inventory);
        }
    }
}
