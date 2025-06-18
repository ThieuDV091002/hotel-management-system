package com.example.HMS.dto;

import com.example.HMS.model.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDTO {
    private Long id;
    private String fullName;
    private String username;
    private String password;
    private String email;
    private String phoneNumber;
    @JsonProperty("isActive")
    private boolean isActive;
    private Role role;
    private String position;
    private BigDecimal salary;
    private LocalDate hireDate;
}
