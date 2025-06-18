package com.example.HMS.controller;

import com.example.HMS.dto.OperatingExpenseDTO;
import com.example.HMS.service.OperatingExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class OperatingExpenseController {

    private final OperatingExpenseService expenseService;

    @PostMapping
    public ResponseEntity<OperatingExpenseDTO> createExpense(@RequestBody OperatingExpenseDTO expenseDTO) {
        OperatingExpenseDTO createdExpense = expenseService.createExpense(expenseDTO);
        return ResponseEntity.ok(createdExpense);
    }

    @GetMapping
    public ResponseEntity<Page<OperatingExpenseDTO>> getExpenses(
            @RequestParam(required = false) String provider,
            @RequestParam(required = false) String expenseType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OperatingExpenseDTO> expenses = expenseService.getExpenses(provider, expenseType, pageable);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperatingExpenseDTO> getExpenseById(@PathVariable Long id) {
        return expenseService.getExpenseById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<OperatingExpenseDTO> updateExpense(@PathVariable Long id, @RequestBody OperatingExpenseDTO expenseDTO) {
        OperatingExpenseDTO updatedExpense = expenseService.updateExpense(id, expenseDTO);
        return ResponseEntity.ok(updatedExpense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OperatingExpenseDTO> updateExpenseStatus(@PathVariable Long id, @RequestParam String status) {
        OperatingExpenseDTO updatedExpense = expenseService.updateExpenseStatus(id, status);
        return ResponseEntity.ok(updatedExpense);
    }
}
