package com.example.HMS.repository;

import com.example.HMS.model.ExpenseType;
import com.example.HMS.model.OperatingExpenses;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OperatingExpenseRepository extends JpaRepository<OperatingExpenses, Long> {
    Page<OperatingExpenses> findByProviderContainingIgnoreCaseOrExpenseType(String provider, ExpenseType expenseType, Pageable pageable);
    Page<OperatingExpenses> findByProviderContainingIgnoreCase(String provider, Pageable pageable);
    Page<OperatingExpenses> findByExpenseType(ExpenseType expenseType, Pageable pageable);
    List<OperatingExpenses> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    @Query("SELECT e FROM OperatingExpenses e " +
            "WHERE (:provider IS NULL OR e.provider LIKE LOWER(CONCAT('%', :provider, '%'))) " +
            "AND (:expenseType IS NULL OR e.expenseType = :expenseType)")
    Page<OperatingExpenses> searchExpenses(@Param("provider") String provider,
                                           @Param("expenseType") ExpenseType expenseType,
                                           Pageable pageable);
}
