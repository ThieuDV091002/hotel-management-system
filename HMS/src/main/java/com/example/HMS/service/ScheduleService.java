package com.example.HMS.service;

import com.example.HMS.dto.ScheduleRequest;
import com.example.HMS.dto.ScheduleResponse;
import com.example.HMS.dto.WeeklyScheduleResponse;
import com.example.HMS.model.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleService {
    List<ScheduleResponse> createSchedule(ScheduleRequest request);
    Page<WeeklyScheduleResponse> getScheduleForWeek(LocalDate startDate, String fullName, Pageable pageable);
    Page<ScheduleResponse> getEmployeeSchedule(Employee employee, LocalDate startDate, Pageable pageable);
    List<ScheduleResponse> getMaintenanceEmployeesAtTime(LocalDateTime time);
    ScheduleResponse updateShift(Long scheduleId, String newShift);
    void deleteSchedule(Long scheduleId);
    ScheduleResponse createSingleSchedule(ScheduleRequest request);
}
