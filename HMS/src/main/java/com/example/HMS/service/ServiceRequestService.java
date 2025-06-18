package com.example.HMS.service;

import com.example.HMS.dto.ServiceRequestDTO;
import com.example.HMS.model.ServiceRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ServiceRequestService {
    // Customer APIs
    ServiceRequestDTO createRequest(ServiceRequestDTO requestDTO, Long customerId);
    Page<ServiceRequestDTO> getCustomerRequests(Long customerId, ServiceRequestStatus status, Pageable pageable);
    ServiceRequestDTO getRequestById(Long id, Long customerId, String token);
    void cancelRequest(Long id, Long customerId, String token);
    ServiceRequestDTO updateRequest(Long id, ServiceRequestDTO requestDTO, Long customerId, String token);
    void requestOTP(Long requestId, String token);
    void verifyOTP(Long requestId, String token, String otp);
    boolean checkOTPStatus(Long requestId, String token);

    // Admin APIs
    Page<ServiceRequestDTO> getAllRequests(String customerName, Pageable pageable);
    ServiceRequestDTO getRequestByIdAdmin(Long id);
    ServiceRequestDTO updateRequestStatus(Long id, ServiceRequestStatus status);
}
