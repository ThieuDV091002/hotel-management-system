package com.example.HMS.service;

import com.example.HMS.dto.SupplierDTO;
import com.example.HMS.model.Supplier;
import com.example.HMS.repository.SupplierRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService{
    private final SupplierRepository supplierRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<SupplierDTO> getSuppliers(String name, Pageable pageable) {
        Page<Supplier> suppliers;
        if (name != null && !name.isEmpty()) {
            suppliers = supplierRepository.findBySupplierNameContainingIgnoreCase(name, pageable);
        } else {
            suppliers = supplierRepository.findAll(pageable);
        }
        return suppliers.map(supplier -> modelMapper.map(supplier, SupplierDTO.class));
    }

    @Override
    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        return modelMapper.map(supplier, SupplierDTO.class);
    }

    @Override
    @Transactional
    public SupplierDTO createSupplier(SupplierDTO supplierDTO) {
        Supplier supplier = new Supplier();
        supplier.setSupplierName(supplierDTO.getSupplierName());
        supplier.setSupplierAddress(supplierDTO.getSupplierAddress());
        supplier.setSupplierPhone(supplierDTO.getSupplierPhone());
        Supplier savedSupplier = supplierRepository.save(supplier);
        return modelMapper.map(savedSupplier, SupplierDTO.class);
    }

    @Override
    @Transactional
    public SupplierDTO updateSupplier(Long id, SupplierDTO supplierDTO) {
        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        existingSupplier.setSupplierName(supplierDTO.getSupplierName());
        existingSupplier.setSupplierAddress(supplierDTO.getSupplierAddress());
        existingSupplier.setSupplierPhone(supplierDTO.getSupplierPhone());

        Supplier updatedSupplier = supplierRepository.save(existingSupplier);
        return modelMapper.map(updatedSupplier, SupplierDTO.class);
    }

    @Override
    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        supplierRepository.delete(supplier);
    }
}
