package com.example.HMS.repository;

import com.example.HMS.model.Salary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SalaryRepository extends JpaRepository<Salary, Long> {
    Page<Salary> findByEmployeeFullNameContainingIgnoreCase(String fullName, Pageable pageable);
    Page<Salary> findByEmployeeId(Long employeeId, Pageable pageable);
    List<Salary> findByPayTimeBetween(LocalDateTime start, LocalDateTime end);
}
