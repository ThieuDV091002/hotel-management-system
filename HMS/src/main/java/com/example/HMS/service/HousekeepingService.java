package com.example.HMS.service;

import com.example.HMS.dto.CheckoutRequest;
import com.example.HMS.dto.HousekeepingScheduleDTO;
import com.example.HMS.model.ScheduleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

public interface HousekeepingService {
    HousekeepingScheduleDTO processCheckout(CheckoutRequest request);
    HousekeepingScheduleDTO approveHousekeepingRequest(Long requestId);
    Page<HousekeepingScheduleDTO> getHousekeepingSchedules(String roomName, String employeeName, Pageable pageable);
    Optional<HousekeepingScheduleDTO> getHousekeepingScheduleById(Long id);
    HousekeepingScheduleDTO updateHousekeepingScheduleStatus(Long id, ScheduleStatus status);
    void deleteHousekeepingSchedule(Long id);
    Page<HousekeepingScheduleDTO> getMyHousekeepingSchedules(UserDetails userDetails, Pageable pageable);
}
