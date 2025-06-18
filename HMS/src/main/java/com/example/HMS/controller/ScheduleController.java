package com.example.HMS.controller;

import com.example.HMS.dto.ScheduleRequest;
import com.example.HMS.dto.ScheduleResponse;
import com.example.HMS.dto.ShiftUpdateRequest;
import com.example.HMS.dto.WeeklyScheduleResponse;
import com.example.HMS.model.Employee;
import com.example.HMS.repository.EmployeeRepository;
import com.example.HMS.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {
    private final ScheduleService scheduleService;
    private final EmployeeRepository employeeRepository;

    @PostMapping
    public List<ScheduleResponse> createSchedule(@RequestBody ScheduleRequest request) {
        return scheduleService.createSchedule(request);
    }

    @GetMapping("/list")
    @PreAuthorize("hasAuthority('ADMIN')")
    public Page<WeeklyScheduleResponse> getScheduleForWeek(
            @RequestParam(value = "startDate", defaultValue = "2025-05-05") String startDate,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return scheduleService.getScheduleForWeek(LocalDate.parse(startDate), fullName, pageable);
    }

    @GetMapping("/my-schedule")
    @PreAuthorize("hasAnyAuthority('RECEPTIONIST', 'WAITER', 'SECURITY', 'HOUSEKEEPING', 'MAINTENANCE', 'POS_SERVICE', 'CHEF')")
    public Page<ScheduleResponse> getMySchedule(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "7") int size) {
        String username = userDetails.getUsername();
        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Pageable pageable = PageRequest.of(page, size);
        LocalDate date = startDate != null ? LocalDate.parse(startDate) : null;
        return scheduleService.getEmployeeSchedule(employee, date, pageable);
    }

    @GetMapping("/maintenance")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<ScheduleResponse> getMaintenanceEmployees(
            @RequestParam("time") String time) {
        return scheduleService.getMaintenanceEmployeesAtTime(LocalDateTime.parse(time));
    }

    @PutMapping("/{scheduleId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ScheduleResponse updateShift(
            @PathVariable Long scheduleId,
            @RequestBody ShiftUpdateRequest request) {
        return scheduleService.updateShift(scheduleId, request.getShift());
    }

    @DeleteMapping("/{scheduleId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void deleteSchedule(@PathVariable Long scheduleId) {
        scheduleService.deleteSchedule(scheduleId);
    }

    @PostMapping("/single")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ScheduleResponse createSingleSchedule(@RequestBody ScheduleRequest request) {
        return scheduleService.createSingleSchedule(request);
    }
}
