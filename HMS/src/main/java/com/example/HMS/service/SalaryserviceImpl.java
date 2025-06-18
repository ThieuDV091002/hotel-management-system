package com.example.HMS.service;

import com.example.HMS.dto.SalaryDTO;
import com.example.HMS.model.Employee;
import com.example.HMS.model.ExpenseStatus;
import com.example.HMS.model.Salary;
import com.example.HMS.repository.EmployeeRepository;
import com.example.HMS.repository.SalaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalaryserviceImpl implements SalaryService{
    private final SalaryRepository salaryRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public List<SalaryDTO> createSalariesForAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();

        List<Salary> salaries = employees.stream().map(employee -> Salary.builder()
                .employee(employee)
                .amount(employee.getSalary().doubleValue())
                .status(ExpenseStatus.UNPAID)
                .createdAt(LocalDateTime.now())
                .build()
        ).collect(Collectors.toList());

        List<Salary> savedSalaries = salaryRepository.saveAll(salaries);

        return savedSalaries.stream().map(this::mapToDTO).collect(Collectors.toList());
    }



    @Override
    public Page<SalaryDTO> getSalaries(String employeeName, Pageable pageable) {
        Page<Salary> salaries;
        if (employeeName != null && !employeeName.isEmpty()) {
            salaries = salaryRepository.findByEmployeeFullNameContainingIgnoreCase(employeeName, pageable);
        } else {
            salaries = salaryRepository.findAll(pageable);
        }
        return salaries.map(this::mapToDTO);
    }

    @Override
    public Optional<SalaryDTO> getSalaryById(Long id) {
        return salaryRepository.findById(id).map(this::mapToDTO);
    }

    @Override
    public SalaryDTO updateSalary(Long id, SalaryDTO salaryDTO) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salary not found"));

        Employee employee = employeeRepository.findById(salaryDTO.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        salary.setEmployee(employee);
        salary.setPayTime(salaryDTO.getPayTime());
        salary.setAmount(salaryDTO.getAmount());
        salary.setStatus(salaryDTO.getStatus());

        Salary updatedSalary = salaryRepository.save(salary);
        return mapToDTO(updatedSalary);
    }

    @Override
    public void deleteSalary(Long id) {
        if (!salaryRepository.existsById(id)) {
            throw new RuntimeException("Salary not found");
        }
        salaryRepository.deleteById(id);
    }

    @Override
    public SalaryDTO updateSalaryStatus(Long id, String status) {
        Salary salary = salaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salary not found"));

        salary.setStatus(ExpenseStatus.valueOf(status));
        if (salary.getStatus() == ExpenseStatus.PAID) {
            salary.setPayTime(LocalDateTime.now());
        }
        Salary updatedSalary = salaryRepository.save(salary);
        return mapToDTO(updatedSalary);
    }

    @Override
    public Page<SalaryDTO> getMySalaries(Long employeeId, Pageable pageable) {
        Page<Salary> salaries = salaryRepository.findByEmployeeId(employeeId, pageable);
        return salaries.map(this::mapToDTO);
    }

    private SalaryDTO mapToDTO(Salary salary) {
        return SalaryDTO.builder()
                .id(salary.getId())
                .employeeId(salary.getEmployee().getId())
                .employeeName(salary.getEmployee().getFullName())
                .payTime(salary.getPayTime())
                .amount(salary.getAmount())
                .status(salary.getStatus())
                .createdAt(salary.getCreatedAt())
                .build();
    }
}
