package com.example.HMS.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@DiscriminatorValue("EMPLOYEE")
@NoArgsConstructor
@AllArgsConstructor
@Data
@SuperBuilder
public class Employee extends User {
    private String position;

    @Column(name = "salary")
    private BigDecimal salary;

    @Column(name = "hire_date")
    private LocalDate hireDate;
}
