package com.example.HMS.repository;

import com.example.HMS.model.Employee;
import com.example.HMS.model.WorkSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {
    Page<WorkSchedule> findByDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
    Page<WorkSchedule> findByEmployeeAndDateBetween(Employee employee, LocalDate startDate, LocalDate endDate, Pageable pageable);
    Page<WorkSchedule> findByEmployee(Employee employee, Pageable pageable);
    List<WorkSchedule> findByEmployeeInAndDateBetween(List<Employee> employees, LocalDate start, LocalDate end);
    List<WorkSchedule> findByEmployeeInAndDate(List<Employee> employees, LocalDate date);
    List<WorkSchedule> findByDateAndShift(LocalDate date, String shift);
    void deleteByDateBetween(LocalDate startDate, LocalDate endDate);
    List<WorkSchedule> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<WorkSchedule> findByEmployeeAndDate(Employee employee, LocalDate date);
    @Query("SELECT ws FROM WorkSchedule ws JOIN ws.employee e WHERE ws.date = :date AND ws.shift = :shift AND e.position = :position")
    List<WorkSchedule> findByDateAndShiftAndEmployeePosition(@Param("date") LocalDate date, @Param("shift") String shift, @Param("position") String position);
}
