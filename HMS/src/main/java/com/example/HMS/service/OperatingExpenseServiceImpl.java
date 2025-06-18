package com.example.HMS.service;

import com.example.HMS.dto.OperatingExpenseDTO;
import com.example.HMS.model.ExpenseStatus;
import com.example.HMS.model.ExpenseType;
import com.example.HMS.model.OperatingExpenses;
import com.example.HMS.repository.OperatingExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OperatingExpenseServiceImpl implements OperatingExpenseService {

    private final OperatingExpenseRepository expenseRepository;

    @Override
    public OperatingExpenseDTO createExpense(OperatingExpenseDTO expenseDTO) {
        OperatingExpenses expense = OperatingExpenses.builder()
                .expenseType(expenseDTO.getExpenseType())
                .status(ExpenseStatus.UNPAID)
                .description(expenseDTO.getDescription())
                .amount(expenseDTO.getAmount())
                .provider(expenseDTO.getProvider())
                .dueDate(expenseDTO.getDueDate())
                .createdAt(expenseDTO.getCreatedAt())
                .build();

        OperatingExpenses savedExpense = expenseRepository.save(expense);
        return mapToDTO(savedExpense);
    }

    @Override
    public Page<OperatingExpenseDTO> getExpenses(String provider, String expenseType, Pageable pageable) {
        ExpenseType type = null;
        if (expenseType != null && !expenseType.isEmpty()) {
            try {
                type = ExpenseType.valueOf(expenseType);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid expense type: " + expenseType);
            }
        }

        Page<OperatingExpenses> expenses = expenseRepository.searchExpenses(provider, type, pageable);
        return expenses.map(this::mapToDTO);
    }


    @Override
    public Optional<OperatingExpenseDTO> getExpenseById(Long id) {
        return expenseRepository.findById(id).map(this::mapToDTO);
    }

    @Override
    public OperatingExpenseDTO updateExpense(Long id, OperatingExpenseDTO expenseDTO) {
        OperatingExpenses expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expense.setExpenseType(expenseDTO.getExpenseType());
        expense.setStatus(expenseDTO.getStatus());
        expense.setDescription(expenseDTO.getDescription());
        expense.setAmount(expenseDTO.getAmount());
        expense.setProvider(expenseDTO.getProvider());
        expense.setDueDate(expenseDTO.getDueDate());
        expense.setCreatedAt(expenseDTO.getCreatedAt());

        OperatingExpenses updatedExpense = expenseRepository.save(expense);
        return mapToDTO(updatedExpense);
    }

    @Override
    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new RuntimeException("Expense not found");
        }
        expenseRepository.deleteById(id);
    }

    @Override
    public OperatingExpenseDTO updateExpenseStatus(Long id, String status) {
        OperatingExpenses expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expense.setStatus(ExpenseStatus.valueOf(status));
        OperatingExpenses updatedExpense = expenseRepository.save(expense);
        return mapToDTO(updatedExpense);
    }

    private OperatingExpenseDTO mapToDTO(OperatingExpenses expense) {
        return OperatingExpenseDTO.builder()
                .id(expense.getId())
                .expenseType(expense.getExpenseType())
                .status(expense.getStatus())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .provider(expense.getProvider())
                .dueDate(expense.getDueDate())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
