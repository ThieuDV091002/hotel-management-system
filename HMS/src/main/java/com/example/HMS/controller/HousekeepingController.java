package com.example.HMS.controller;

import com.example.HMS.dto.CheckoutRequest;
import com.example.HMS.dto.HousekeepingScheduleDTO;
import com.example.HMS.model.ScheduleStatus;
import com.example.HMS.service.HousekeepingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/housekeeping")
@RequiredArgsConstructor
public class HousekeepingController {

    private final HousekeepingService housekeepingService;

    @PostMapping("/checkout")
    public ResponseEntity<HousekeepingScheduleDTO> checkout(@RequestBody CheckoutRequest request) {
        HousekeepingScheduleDTO schedule = housekeepingService.processCheckout(request);
        return ResponseEntity.ok(schedule);
    }

    @PostMapping("/approve/{requestId}")
    public ResponseEntity<HousekeepingScheduleDTO> approveHousekeepingRequest(@PathVariable Long requestId) {
        HousekeepingScheduleDTO schedule = housekeepingService.approveHousekeepingRequest(requestId);
        return ResponseEntity.ok(schedule);
    }

    @GetMapping("/schedules")
    public ResponseEntity<Page<HousekeepingScheduleDTO>> getHousekeepingSchedules(
            @RequestParam(required = false) String roomName,
            @RequestParam(required = false) String employeeName,
            Pageable pageable) {
        Page<HousekeepingScheduleDTO> schedules = housekeepingService.getHousekeepingSchedules(roomName, employeeName, pageable);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/schedules/{id}")
    public ResponseEntity<HousekeepingScheduleDTO> getHousekeepingScheduleById(@PathVariable Long id) {
        return housekeepingService.getHousekeepingScheduleById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/schedules/{id}")
    public ResponseEntity<HousekeepingScheduleDTO> updateHousekeepingScheduleStatus(@PathVariable Long id, @RequestBody ScheduleStatus status) {
        housekeepingService.updateHousekeepingScheduleStatus(id, status);
        return ResponseEntity.ok(housekeepingService.getHousekeepingScheduleById(id).orElseThrow());
    }

    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<Void> deleteHousekeepingSchedule(@PathVariable Long id) {
        housekeepingService.deleteHousekeepingSchedule(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my-schedules")
    public ResponseEntity<Page<HousekeepingScheduleDTO>> getMyHousekeepingSchedules(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<HousekeepingScheduleDTO> schedules = housekeepingService.getMyHousekeepingSchedules(userDetails, pageable);
        return ResponseEntity.ok(schedules);
    }

}

