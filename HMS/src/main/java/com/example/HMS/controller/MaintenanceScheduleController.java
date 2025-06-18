package com.example.HMS.controller;

import com.example.HMS.dto.MaintenanceScheduleCreateDTO;
import com.example.HMS.dto.MaintenanceScheduleDTO;
import com.example.HMS.dto.MaintenanceScheduleUpdateDTO;
import com.example.HMS.model.MaintenanceSchedule;
import com.example.HMS.model.ScheduleStatus;
import com.example.HMS.service.MaintenanceScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance-schedules")
@RequiredArgsConstructor
public class MaintenanceScheduleController {

    private final MaintenanceScheduleService scheduleService;

    @PostMapping
    public ResponseEntity<MaintenanceScheduleDTO> createMaintenanceSchedule(@RequestBody MaintenanceScheduleCreateDTO createDTO) {
        MaintenanceScheduleDTO schedule = scheduleService.createMaintenanceSchedule(createDTO);
        return ResponseEntity.ok(schedule);
    }

    @GetMapping
    public ResponseEntity<Page<MaintenanceScheduleDTO>> getAllMaintenanceSchedules(
            Pageable pageable,
            @RequestParam(required = false) Integer assetId,
            @RequestParam(required = false) Integer roomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date endDate) {
        Page<MaintenanceScheduleDTO> schedules = scheduleService.getAllMaintenanceSchedules(pageable, assetId, roomId, startDate, endDate);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceScheduleDTO> getMaintenanceScheduleById(@PathVariable Integer id) {
        MaintenanceScheduleDTO schedule = scheduleService.getMaintenanceScheduleById(id);
        return ResponseEntity.ok(schedule);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceScheduleDTO> updateMaintenanceSchedule(@PathVariable Integer id, @RequestBody MaintenanceScheduleUpdateDTO updateDTO) {
        MaintenanceScheduleDTO schedule = scheduleService.updateMaintenanceSchedule(id, updateDTO);
        return ResponseEntity.ok(schedule);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteMaintenanceSchedule(@PathVariable Integer id) {
        scheduleService.deleteMaintenanceSchedule(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping(value = "/{id}/status", consumes = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<Void> updateMaintenanceScheduleStatus(@PathVariable Integer id, @RequestBody String status) {
        try {
            ScheduleStatus enumStatus = ScheduleStatus.valueOf(status.toUpperCase());
            scheduleService.updateMaintenanceScheduleStatus(id, enumStatus);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + status);
        }
    }

    @GetMapping("/my-schedules")
    public ResponseEntity<Map<String, Object>> getMyMaintenanceSchedules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<MaintenanceScheduleDTO> allSchedules = scheduleService.getMaintenanceSchedulesForLoggedInEmployee();

        int totalElements = allSchedules.size();
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);

        if (fromIndex >= totalElements) {
            return ResponseEntity.ok(Map.of(
                    "schedules", List.of(),
                    "currentPage", page,
                    "totalItems", totalElements,
                    "totalPages", (int) Math.ceil((double) totalElements / size)
            ));
        }

        List<MaintenanceScheduleDTO> paginatedSchedules = allSchedules.subList(fromIndex, toIndex);

        Map<String, Object> response = new HashMap<>();
        response.put("schedules", paginatedSchedules);
        response.put("currentPage", page);
        response.put("totalItems", totalElements);
        response.put("totalPages", (int) Math.ceil((double) totalElements / size));

        return ResponseEntity.ok(response);
    }

}
