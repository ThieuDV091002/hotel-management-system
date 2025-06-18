package com.example.HMS.controller;

import com.example.HMS.dto.ServiceUsageDTO;
import com.example.HMS.service.ServiceUsageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookings/{bookingId}/service-usages")
public class ServiceUsageController {
    private final ServiceUsageService serviceUsageService;

    @PostMapping
    public ResponseEntity<ServiceUsageDTO> createServiceUsage(
            @PathVariable Long bookingId,
            @Valid @RequestBody ServiceUsageDTO serviceUsageDTO) {
        return ResponseEntity.ok(serviceUsageService.createServiceUsage(bookingId, serviceUsageDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceUsageDTO> updateServiceUsage(
            @PathVariable Long bookingId,
            @PathVariable Long id,
            @Valid @RequestBody ServiceUsageDTO serviceUsageDTO) {
        return ResponseEntity.ok(serviceUsageService.updateServiceUsage(bookingId, id, serviceUsageDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteServiceUsage(
            @PathVariable Long bookingId,
            @PathVariable Long id) {
        serviceUsageService.deleteServiceUsage(bookingId, id);
        return ResponseEntity.ok("Service usage deleted successfully");
    }
}
