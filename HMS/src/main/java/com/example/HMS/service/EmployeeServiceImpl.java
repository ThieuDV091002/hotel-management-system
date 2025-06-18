package com.example.HMS.service;

import com.example.HMS.dto.ChangePasswordDTO;
import com.example.HMS.dto.EmployeeDTO;
import com.example.HMS.dto.UpdateUProfileDTO;
import com.example.HMS.exception.ResourceNotFoundException;
import com.example.HMS.model.Employee;
import com.example.HMS.model.Role;
import com.example.HMS.model.User;
import com.example.HMS.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private static final String DEFAULT_PASSWORD = "12345678";

    @Override
    public EmployeeDTO getEmployeeProfile(String username) {
        Employee employee = userRepository.findByUsername(username)
                .filter(user -> user instanceof Employee)
                .map(user -> (Employee) user)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found with username: " + username));
        return modelMapper.map(employee, EmployeeDTO.class);
    }

    @Override
    public EmployeeDTO updateEmployeeProfile(String username, UpdateUProfileDTO dto) {
        Employee employee = userRepository.findByUsername(username)
                .filter(user -> user instanceof Employee)
                .map(user -> (Employee) user)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found with username: " + username));

        employee.setFullName(dto.getFullName());
        employee.setPhoneNumber(dto.getPhoneNumber());
        employee.setEmail(dto.getEmail());

        Employee updatedEmployee = userRepository.save(employee);
        return modelMapper.map(updatedEmployee, EmployeeDTO.class);
    }

    @Override
    public void changePassword(String username, ChangePasswordDTO dto) {
        Employee employee = userRepository.findByUsername(username)
                .filter(user -> user instanceof Employee)
                .map(user -> (Employee) user)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found with username: " + username));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), employee.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation do not match");
        }

        employee.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(employee);
    }

    @Override
    public Page<EmployeeDTO> getAllEmployees(String fullName, Role role, int page, int size) {
        Specification<User> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.notEqual(root.get("role"), Role.CUSTOMER));

            if (fullName != null && !fullName.isEmpty()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")),
                        "%" + fullName.toLowerCase() + "%"));
            }

            if (role != null) {
                predicates.add(criteriaBuilder.equal(root.get("role"), role));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(page, size);
        Page<User> employeesPage = userRepository.findAll(spec, pageable);
        return employeesPage.map(user -> modelMapper.map(user, EmployeeDTO.class));
    }

    @Override
    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = userRepository.findById(id)
                .filter(user -> user instanceof Employee)
                .map(user -> (Employee) user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return modelMapper.map(employee, EmployeeDTO.class);
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee employee = userRepository.findById(id)
                .filter(user -> user instanceof Employee)
                .map(user -> (Employee) user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        userRepository.delete(employee);
    }

    @Override
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO dto) {
        Employee employee = userRepository.findById(id)
                .filter(user -> user instanceof Employee)
                .map(user -> (Employee) user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setFullName(dto.getFullName());
        employee.setUsername(dto.getUsername());
        employee.setEmail(dto.getEmail());
        employee.setPhoneNumber(dto.getPhoneNumber());
        employee.setActive(dto.isActive());
        employee.setRole(dto.getRole());
        employee.setPosition(dto.getRole().name().toLowerCase());
        employee.setSalary(dto.getSalary());
        employee.setHireDate(dto.getHireDate());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            employee.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        Employee updatedEmployee = userRepository.save(employee);
        return modelMapper.map(updatedEmployee, EmployeeDTO.class);
    }

    @Override
    public void resetPassword(Long id) {
        Employee employee = userRepository.findById(id)
                .filter(user -> user instanceof Employee)
                .map(user -> (Employee) user)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
        userRepository.save(employee);

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(employee.getEmail());
        mail.setSubject("Password Reset Notification");
        mail.setText("Your password has been reset to: " + DEFAULT_PASSWORD +
                "\nPlease change it after logging in.");
        mailSender.send(mail);
    }

    @Override
    public EmployeeDTO createEmployee(EmployeeDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username is already in use");
        }

        Employee employee = Employee.builder()
                .fullName(dto.getFullName())
                .username(dto.getUsername())
                .password(passwordEncoder.encode("password"))
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .isActive(true)
                .role(dto.getRole())
                .position(dto.getRole().name().toLowerCase())
                .salary(dto.getSalary())
                .hireDate(dto.getHireDate())
                .build();

        Employee savedEmployee = userRepository.save(employee);
        return modelMapper.map(savedEmployee, EmployeeDTO.class);
    }
}
