package com.example.HMS.service;


import com.example.HMS.dto.ServiceUsageDTO;

public interface ServiceUsageService {
    ServiceUsageDTO createServiceUsage(Long bookingId, ServiceUsageDTO serviceUsageDTO);
    ServiceUsageDTO updateServiceUsage(Long bookingId, Long id, ServiceUsageDTO serviceUsageDTO);
    void deleteServiceUsage(Long bookingId, Long id);
}
