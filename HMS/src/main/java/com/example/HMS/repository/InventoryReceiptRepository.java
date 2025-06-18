package com.example.HMS.repository;

import com.example.HMS.model.InventoryReceipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryReceiptRepository extends JpaRepository<InventoryReceipt, Long> {
    @Query("SELECT r FROM InventoryReceipt r " +
            "WHERE (:receiptCode IS NULL OR r.receiptCode LIKE LOWER(CONCAT('%', :receiptCode, '%'))) " +
            "AND (:supplierName IS NULL OR r.supplier.supplierName LIKE LOWER(CONCAT('%', :supplierName, '%')))")
    Page<InventoryReceipt> searchInventoryReceipts(
            @Param("receiptCode") String receiptCode,
            @Param("supplierName") String supplierName,
            Pageable pageable);
    List<InventoryReceipt> findByReceiptDateBetween(LocalDateTime start, LocalDateTime end);
}
