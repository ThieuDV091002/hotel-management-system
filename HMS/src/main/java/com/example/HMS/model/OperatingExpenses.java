package com.example.HMS.model;

import jakarta.persistence.*;
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
@Entity
public class OperatingExpenses {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    private ExpenseType expenseType;
    @Enumerated(EnumType.STRING)
    private ExpenseStatus status;
    private String description;
    private double amount;
    private String provider;
    private Date dueDate;
    private LocalDateTime createdAt;
}
