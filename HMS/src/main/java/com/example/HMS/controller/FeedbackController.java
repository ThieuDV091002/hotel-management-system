package com.example.HMS.controller;

import com.example.HMS.dto.FeedbackDTO;
import com.example.HMS.exception.ResourceNotFoundException;
import com.example.HMS.model.Customer;
import com.example.HMS.model.Role;
import com.example.HMS.model.User;
import com.example.HMS.repository.CustomerRepository;
import com.example.HMS.repository.UserRepository;
import com.example.HMS.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<FeedbackDTO> createFeedback(
            @RequestBody FeedbackDTO feedbackDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long customerId = userDetails != null ? getCustomerIdFromUserDetails(userDetails) : null;
        FeedbackDTO createdFeedback = feedbackService.createFeedback(feedbackDTO, customerId);
        return ResponseEntity.ok(createdFeedback);
    }

    @GetMapping("/my-feedback")
    public ResponseEntity<Page<FeedbackDTO>> getMyFeedback(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Long bookingId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long customerId = getCustomerIdFromUserDetails(userDetails);
        Pageable pageable = PageRequest.of(page, size);
        Page<FeedbackDTO> feedback = feedbackService.getMyFeedback(customerId, bookingId, rating, pageable);
        return ResponseEntity.ok(feedback);
    }

    @GetMapping
    public ResponseEntity<Page<FeedbackDTO>> getAllFeedback(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) Long bookingId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FeedbackDTO> feedback = feedbackService.getAllFeedback(customerName, bookingId, rating, pageable);
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackDTO> getFeedbackById(
            @PathVariable Long id,
            @RequestParam(required = false) String token,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long customerId = null;
        Role role = null;

        if (userDetails != null) {
            customerId = getCustomerIdFromUserDetails(userDetails);
            role = getRoleFromUserDetails(userDetails); // bạn cần định nghĩa thêm
        }

        return feedbackService.getFeedbackById(id, customerId, role, token)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id,
                                               @RequestParam(required = false) String token,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        Long customerId = userDetails != null ? getCustomerIdFromUserDetails(userDetails) : null;
        feedbackService.deleteFeedback(id, customerId, token);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeedbackDTO> updateFeedback(
            @PathVariable Long id,
            @RequestBody FeedbackDTO feedbackDTO,
            @RequestParam(required = false) String token,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long customerId = userDetails != null ? getCustomerIdFromUserDetails(userDetails) : null;
        FeedbackDTO updatedFeedback = feedbackService.updateFeedback(id, feedbackDTO, customerId, token);
        return ResponseEntity.ok(updatedFeedback);
    }

    @PostMapping("/{id}/request-otp")
    public ResponseEntity<String> requestOTP(@PathVariable Long id, @RequestParam String token) {
        feedbackService.requestOTP(id, token);
        return ResponseEntity.ok("OTP sent to your email");
    }

    @PostMapping("/{id}/verify-otp")
    public ResponseEntity<String> verifyOTP(@PathVariable Long id,
                                            @RequestParam String token,
                                            @RequestParam String otp) {
        feedbackService.verifyOTP(id, token, otp);
        return ResponseEntity.ok("OTP verified successfully");
    }

    @GetMapping("/{id}/otp-status")
    public ResponseEntity<Boolean> checkOTPStatus(@PathVariable Long id, @RequestParam String token) {
        boolean isVerified = feedbackService.checkOTPStatus(id, token);
        return ResponseEntity.ok(isVerified);
    }

    @GetMapping("/latest")
    public ResponseEntity<List<FeedbackDTO>> getLatestFeedbacks(
            @RequestParam(defaultValue = "10") int limit) {
        List<FeedbackDTO> latestFeedbacks = feedbackService.getLatestFeedbacks(limit);
        return ResponseEntity.ok(latestFeedbacks);
    }

    private Long getCustomerIdFromUserDetails(UserDetails userDetails) {
        String username = userDetails.getUsername();
        return customerRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with username: " + username));
    }

    private Role getRoleFromUserDetails(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .map(User::getRole)
                .orElse(null);
    }
}
