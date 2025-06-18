package com.example.HMS.dto;

import com.example.HMS.model.ExpenseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDateTime payTime;
    private double amount;
    private ExpenseStatus status;
    private LocalDateTime createdAt;
}
