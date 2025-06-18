package com.example.HMS.repository;

import com.example.HMS.model.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Page<Supplier> findBySupplierNameContainingIgnoreCase(String name, Pageable pageable);
    Optional<Supplier> findBySupplierName(String supplierName);
}
