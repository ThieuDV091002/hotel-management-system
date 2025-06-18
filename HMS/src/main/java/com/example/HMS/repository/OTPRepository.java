package com.example.HMS.repository;

import com.example.HMS.model.OTP;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findByOtpAndRequestIdAndRequestType(String otp, Long requestId, String requestType);
    List<OTP> findByRequestIdAndRequestTypeAndIsUsed(Long requestId, String requestType, boolean isUsed);
}
