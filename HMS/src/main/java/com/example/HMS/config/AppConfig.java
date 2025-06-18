package com.example.HMS.config;

import com.example.HMS.dto.InventoryDTO;
import com.example.HMS.dto.InventoryReceiptDTO;
import com.example.HMS.dto.SupplierDTO;
import com.example.HMS.model.Inventory;
import com.example.HMS.model.InventoryReceiptDetail;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.typeMap(Inventory.class, SupplierDTO.InventoryItemDTO.class)
                .addMappings(mapper -> {
                    mapper.map(Inventory::getId, SupplierDTO.InventoryItemDTO::setId);
                    mapper.map(Inventory::getInventoryName, SupplierDTO.InventoryItemDTO::setName);
                });
        modelMapper.typeMap(Inventory.class, InventoryDTO.class)
                .addMappings(mapper -> {
                    mapper.map(src -> src.getSupplier().getId(), InventoryDTO::setSupplierId);
                    mapper.map(src -> src.getSupplier().getSupplierName(), InventoryDTO::setSupplierName);
                });
        modelMapper.typeMap(InventoryReceiptDetail.class, InventoryReceiptDTO.InventoryReceiptDetailDTO.class)
                .addMappings(mapper -> {
                    mapper.map(src -> src.getInventory().getId(), InventoryReceiptDTO.InventoryReceiptDetailDTO::setInventoryId);
                    mapper.map(src -> src.getInventory().getInventoryName(), InventoryReceiptDTO.InventoryReceiptDetailDTO::setInventoryName);
                });
        return modelMapper;
    }
}
