package com.example.HMS.service;

import com.example.HMS.dto.FeedbackDTO;
import com.example.HMS.model.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface FeedbackService {
    FeedbackDTO createFeedback(FeedbackDTO feedbackDTO, Long customerId);
    Page<FeedbackDTO> getMyFeedback(Long customerId, Long bookingId, Integer rating, Pageable pageable);
    Page<FeedbackDTO> getAllFeedback(String customerName, Long bookingId, Integer rating, Pageable pageable);
    Optional<FeedbackDTO> getFeedbackById(Long id, Long customerId, Role role, String token);
    void deleteFeedback(Long id, Long customerId, String token);
    FeedbackDTO updateFeedback(Long id, FeedbackDTO feedbackDTO, Long customerId, String token);
    List<FeedbackDTO> getLatestFeedbacks(int limit);
    void requestOTP(Long feedbackId, String token);
    void verifyOTP(Long feedbackId, String token, String otp);
    boolean checkOTPStatus(Long feedbackId, String token);
}
