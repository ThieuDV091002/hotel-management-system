package com.example.HMS.dto;

import com.example.HMS.model.ExpenseStatus;
import com.example.HMS.model.ExpenseType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperatingExpenseDTO {
    private Long id;
    private ExpenseType expenseType;
    private ExpenseStatus status;
    private String description;
    private double amount;
    private String provider;
    private Date dueDate;
    private LocalDateTime createdAt;
}
