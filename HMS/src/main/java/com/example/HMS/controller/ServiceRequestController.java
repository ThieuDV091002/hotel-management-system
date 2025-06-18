package com.example.HMS.controller;

import com.example.HMS.dto.ServiceRequestDTO;
import com.example.HMS.exception.ResourceNotFoundException;
import com.example.HMS.model.ServiceRequestStatus;
import com.example.HMS.model.User;
import com.example.HMS.repository.CustomerRepository;
import com.example.HMS.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/service-requests")
@RequiredArgsConstructor
public class ServiceRequestController {
    private final ServiceRequestService service;
    private final CustomerRepository customerRepository;

    @PostMapping
    public ResponseEntity<ServiceRequestDTO> createRequest(
            @RequestBody ServiceRequestDTO requestDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long customerId = userDetails != null ? getCustomerIdFromUserDetails(userDetails) : null;
        ServiceRequestDTO createdRequest = service.createRequest(requestDTO, customerId);
        return ResponseEntity.ok(createdRequest);
    }

    @GetMapping
    public ResponseEntity<Page<ServiceRequestDTO>> getRequests(
            @RequestParam(required = false) ServiceRequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long customerId = getCustomerIdFromUserDetails(userDetails);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(service.getCustomerRequests(customerId, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestDTO> getRequestById(
            @PathVariable Long id,
            @RequestParam(required = false) String token,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long customerId = userDetails != null ? getCustomerIdFromUserDetails(userDetails) : null;
        return ResponseEntity.ok(service.getRequestById(id, customerId, token));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancelRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String token,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long customerId = userDetails != null ? getCustomerIdFromUserDetails(userDetails) : null;
        service.cancelRequest(id, customerId, token);
        return ResponseEntity.ok("Request cancelled successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceRequestDTO> updateRequest(
            @PathVariable Long id,
            @RequestBody ServiceRequestDTO requestDTO,
            @RequestParam(required = false) String token,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long customerId = userDetails != null ? getCustomerIdFromUserDetails(userDetails) : null;
        return ResponseEntity.ok(service.updateRequest(id, requestDTO, customerId, token));
    }

    @PostMapping("/{id}/request-otp")
    public ResponseEntity<String> requestOTP(@PathVariable Long id, @RequestParam String token) {
        service.requestOTP(id, token);
        return ResponseEntity.ok("OTP sent to your email");
    }

    @PostMapping("/{id}/verify-otp")
    public ResponseEntity<String> verifyOTP(@PathVariable Long id,
                                            @RequestParam String token,
                                            @RequestParam String otp) {
        service.verifyOTP(id, token, otp);
        return ResponseEntity.ok("OTP verified successfully");
    }

    @GetMapping("/{id}/otp-status")
    public ResponseEntity<Boolean> checkOTPStatus(@PathVariable Long id, @RequestParam String token) {
        boolean isVerified = service.checkOTPStatus(id, token);
        return ResponseEntity.ok(isVerified);
    }


    private Long getCustomerIdFromUserDetails(UserDetails userDetails) {
        String username = userDetails.getUsername();
        return customerRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with username: " + username));
    }
}
