package com.example.HMS.controller;

import com.example.HMS.dto.ServiceRequestDTO;
import com.example.HMS.model.ServiceRequestStatus;
import com.example.HMS.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/service-requests")
public class AdminServiceRequestController {
    private final ServiceRequestService service;

    @GetMapping
    public ResponseEntity<Page<ServiceRequestDTO>> getAllRequests(
            @RequestParam(required = false) String serviceName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(service.getAllRequests(serviceName, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestDTO> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRequestByIdAdmin(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ServiceRequestDTO> updateRequestStatus(
            @PathVariable Long id, @RequestBody ServiceRequestStatus status) {
        return ResponseEntity.ok(service.updateRequestStatus(id, status));
    }
}
