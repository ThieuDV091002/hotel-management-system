package com.example.HMS.controller;

import com.example.HMS.dto.HousekeepingRequestDTO;
import com.example.HMS.model.HousekeepingStatus;
import com.example.HMS.service.HousekeepingRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/housekeeping-requests")
public class AdminHousekeepingRequestController {
    private final HousekeepingRequestService service;

    @GetMapping
    public ResponseEntity<Page<HousekeepingRequestDTO>> getAllRequests(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String roomName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(service.getAllRequests(customerName, roomName, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HousekeepingRequestDTO> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRequestByIdAdmin(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<HousekeepingRequestDTO> updateRequestStatus(
            @PathVariable Long id, @RequestBody HousekeepingStatus status) {
        return ResponseEntity.ok(service.updateRequestStatus(id, status));
    }
}
