package com.example.HMS.repository;

import com.example.HMS.model.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    @Query("SELECT i FROM Inventory i " +
            "WHERE (:inventoryName IS NULL OR i.inventoryName LIKE LOWER(CONCAT('%', :inventoryName, '%'))) " +
            "AND (:supplierName IS NULL OR i.supplier.supplierName LIKE LOWER(CONCAT('%', :supplierName, '%')))")
    Page<Inventory> searchInventories(
            @Param("inventoryName") String inventoryName,
            @Param("supplierName") String supplierName,
            Pageable pageable);
    List<Inventory> findBySupplierId(Long supplierId);
}
