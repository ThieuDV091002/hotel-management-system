package com.example.HMS.service;

import com.example.HMS.dto.ChangePasswordDTO;
import com.example.HMS.dto.EmployeeDTO;
import com.example.HMS.dto.UpdateUProfileDTO;
import com.example.HMS.model.Role;
import org.springframework.data.domain.Page;

public interface EmployeeService {
    EmployeeDTO getEmployeeProfile(String username);
    EmployeeDTO updateEmployeeProfile(String username, UpdateUProfileDTO dto);
    void changePassword(String username, ChangePasswordDTO dto);
    Page<EmployeeDTO> getAllEmployees(String fullName, Role role, int page, int size);
    EmployeeDTO getEmployeeById(Long id);
    void deleteEmployee(Long id);
    EmployeeDTO updateEmployee(Long id, EmployeeDTO dto);
    void resetPassword(Long id);
    EmployeeDTO createEmployee(EmployeeDTO dto);
}
