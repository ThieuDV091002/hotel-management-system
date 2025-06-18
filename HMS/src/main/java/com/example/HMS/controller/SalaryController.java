package com.example.HMS.controller;

import com.example.HMS.dto.SalaryDTO;
import com.example.HMS.model.Employee;
import com.example.HMS.repository.EmployeeRepository;
import com.example.HMS.service.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salaries")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryService salaryService;
    private final EmployeeRepository employeeRepository;

    @PostMapping
    public ResponseEntity<List<SalaryDTO>> createSalary() {
        List<SalaryDTO> createdSalary = salaryService.createSalariesForAllEmployees();
        return ResponseEntity.ok(createdSalary);
    }

    @GetMapping
    public ResponseEntity<Page<SalaryDTO>> getSalaries(
            @RequestParam(required = false) String employeeName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SalaryDTO> salaries = salaryService.getSalaries(employeeName, pageable);
        return ResponseEntity.ok(salaries);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalaryDTO> getSalaryById(@PathVariable Long id) {
        return salaryService.getSalaryById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalaryDTO> updateSalary(@PathVariable Long id, @RequestBody SalaryDTO salaryDTO) {
        SalaryDTO updatedSalary = salaryService.updateSalary(id, salaryDTO);
        return ResponseEntity.ok(updatedSalary);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalary(@PathVariable Long id) {
        salaryService.deleteSalary(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SalaryDTO> updateSalaryStatus(@PathVariable Long id, @RequestParam String status) {
        SalaryDTO updatedSalary = salaryService.updateSalaryStatus(id, status);
        return ResponseEntity.ok(updatedSalary);
    }

    @GetMapping("/my-salaries")
    public ResponseEntity<Page<SalaryDTO>> getMySalaries(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Employee employee = employeeRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Long employeeId = employee.getId();

        Pageable pageable = PageRequest.of(page, size);
        Page<SalaryDTO> salaries = salaryService.getMySalaries(employeeId, pageable);
        return ResponseEntity.ok(salaries);
    }
}
