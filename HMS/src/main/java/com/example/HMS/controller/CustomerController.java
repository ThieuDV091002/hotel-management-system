package com.example.HMS.controller;

import com.example.HMS.dto.*;
import com.example.HMS.model.Role;
import com.example.HMS.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;

    @PatchMapping("/{id}/status")
    public ResponseEntity<CustomerDTO> updateCustomerActiveStatus(@PathVariable Long id,
                                                                  @RequestParam boolean isActive) {
        CustomerDTO updatedCustomer = customerService.updateCustomerActiveStatus(id, isActive);
        return ResponseEntity.ok(updatedCustomer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable Long id) {
        CustomerDTO customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }

    @GetMapping
    public ResponseEntity<Page<CustomerDTO>> getAllCustomers(
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<CustomerDTO> customers = customerService.getAllCustomers(
                fullName, email, phoneNumber, isActive, page, size);
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/profile")
    public ResponseEntity<CustomerDTO> getCustomerProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        CustomerDTO customer = customerService.getCustomerProfile(username);
        return ResponseEntity.ok(customer);
    }

    @PutMapping("/profile")
    public ResponseEntity<CustomerDTO> updateCustomerProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid UpdateProfileDTO dto) {
        String username = userDetails.getUsername();
        CustomerDTO updatedCustomer = customerService.updateCustomerProfile(username, dto);
        return ResponseEntity.ok(updatedCustomer);
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid ChangePasswordDTO dto) {
        String username = userDetails.getUsername();
        customerService.changePassword(username, dto);
        return ResponseEntity.ok("Password changed successfully");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody @Valid ForgotPasswordDTO dto) {
        customerService.createPasswordResetToken(dto.getEmail());
        return ResponseEntity.ok("Password reset email sent (if email exists)");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody @Valid ResetPasswordDTO dto) {
        customerService.resetPassword(dto);
        return ResponseEntity.ok("Password reset successfully");
    }
}

