package com.example.HMS.service;

import com.example.HMS.dto.SalaryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface SalaryService {
    List<SalaryDTO> createSalariesForAllEmployees();
    Page<SalaryDTO> getSalaries(String employeeName, Pageable pageable);
    Optional<SalaryDTO> getSalaryById(Long id);
    SalaryDTO updateSalary(Long id, SalaryDTO salaryDTO);
    void deleteSalary(Long id);
    SalaryDTO updateSalaryStatus(Long id, String status);
    Page<SalaryDTO> getMySalaries(Long employeeId, Pageable pageable);
}
