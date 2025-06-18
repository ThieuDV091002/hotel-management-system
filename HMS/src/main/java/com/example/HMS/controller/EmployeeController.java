package com.example.HMS.controller;

import com.example.HMS.dto.ChangePasswordDTO;
import com.example.HMS.dto.EmployeeDTO;
import com.example.HMS.dto.UpdateUProfileDTO;
import com.example.HMS.model.Role;
import com.example.HMS.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;

    @GetMapping("/profile")
    public ResponseEntity<EmployeeDTO> getEmployeeProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        EmployeeDTO employee = employeeService.getEmployeeProfile(username);
        return ResponseEntity.ok(employee);
    }

    @PutMapping("/profile")
    public ResponseEntity<EmployeeDTO> updateEmployeeProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid UpdateUProfileDTO dto) {
        String username = userDetails.getUsername();
        EmployeeDTO updatedEmployee = employeeService.updateEmployeeProfile(username, dto);
        return ResponseEntity.ok(updatedEmployee);
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid ChangePasswordDTO dto) {
        String username = userDetails.getUsername();
        employeeService.changePassword(username, dto);
        return ResponseEntity.ok("Password changed successfully");
    }

    @GetMapping
    public ResponseEntity<Page<EmployeeDTO>> getAllEmployees(
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<EmployeeDTO> employees = employeeService.getAllEmployees(
                fullName, role, page, size);
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDTO> getEmployeeById(@PathVariable Long id) {
        EmployeeDTO employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(employee);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDTO> updateEmployee(
            @PathVariable Long id, @RequestBody EmployeeDTO dto) {
        EmployeeDTO updatedEmployee = employeeService.updateEmployee(id, dto);
        return ResponseEntity.ok(updatedEmployee);
    }

    @PostMapping("/reset-password/{id}")
    public ResponseEntity<String> resetPassword(@PathVariable Long id) {
        employeeService.resetPassword(id);
        return ResponseEntity.ok("Password reset to default successfully");
    }

    @PostMapping
    public ResponseEntity<EmployeeDTO> createEmployee(@RequestBody @Valid EmployeeDTO dto) {
        EmployeeDTO createdEmployee = employeeService.createEmployee(dto);
        return new ResponseEntity<>(createdEmployee, HttpStatus.CREATED);
    }
}
