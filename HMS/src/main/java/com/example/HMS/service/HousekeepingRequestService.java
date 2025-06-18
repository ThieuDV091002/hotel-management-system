package com.example.HMS.service;

import com.example.HMS.dto.HousekeepingRequestDTO;
import com.example.HMS.model.HousekeepingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface HousekeepingRequestService {
    // Customer APIs
    HousekeepingRequestDTO createRequest(HousekeepingRequestDTO requestDTO, Long customerId);
    Page<HousekeepingRequestDTO> getCustomerRequests(Long customerId, HousekeepingStatus status, Pageable pageable);
    HousekeepingRequestDTO getRequestById(Long id, Long customerId, String token);
    void cancelRequest(Long id, Long customerId, String token);
    HousekeepingRequestDTO updateRequest(Long id, HousekeepingRequestDTO requestDTO, Long customerId, String token);
    void requestOTP(Long requestId, String token);
    void verifyOTP(Long requestId, String token, String otp);
    boolean checkOTPStatus(Long requestId, String token);

    // Admin APIs
    Page<HousekeepingRequestDTO> getAllRequests(String customerName, String roomName, Pageable pageable);
    HousekeepingRequestDTO getRequestByIdAdmin(Long id);
    HousekeepingRequestDTO updateRequestStatus(Long id, HousekeepingStatus status);
}
