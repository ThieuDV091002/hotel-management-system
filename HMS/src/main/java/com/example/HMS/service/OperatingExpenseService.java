package com.example.HMS.service;

import com.example.HMS.dto.OperatingExpenseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface OperatingExpenseService {
    OperatingExpenseDTO createExpense(OperatingExpenseDTO expenseDTO);
    Page<OperatingExpenseDTO> getExpenses(String provider, String expenseType, Pageable pageable);
    Optional<OperatingExpenseDTO> getExpenseById(Long id);
    OperatingExpenseDTO updateExpense(Long id, OperatingExpenseDTO expenseDTO);
    void deleteExpense(Long id);
    OperatingExpenseDTO updateExpenseStatus(Long id, String status);
}
