package com.example.HMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Salary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name="employee_id", nullable = false)
    private Employee employee;

    private LocalDateTime payTime;
    private double amount;
    @Enumerated(EnumType.STRING)
    private ExpenseStatus status;
    private LocalDateTime createdAt;
}
