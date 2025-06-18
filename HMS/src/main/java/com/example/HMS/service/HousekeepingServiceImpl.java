package com.example.HMS.service;

import com.example.HMS.config.HousekeepingQueueManager;
import com.example.HMS.dto.CheckoutRequest;
import com.example.HMS.dto.HousekeepingScheduleDTO;
import com.example.HMS.model.*;
import com.example.HMS.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HousekeepingServiceImpl implements HousekeepingService {
    private final RoomBookingsRepository roomBookingsRepository;
    private final RoomRepository roomRepository;
    private final BookingsRepository bookingsRepository;
    private final HousekeepingRequestRepository housekeepingRequestRepository;
    private final HousekeepingScheduleRepository housekeepingScheduleRepository;
    private final EmployeeRepository employeeRepository;
    private final HousekeepingQueueManager queueManager;

    @Override
    @Transactional
    public HousekeepingScheduleDTO processCheckout(CheckoutRequest request) {
        List<RoomBookings> roomBookings = roomBookingsRepository.findByBookingsId(request.getBookingId());
        if (roomBookings.isEmpty()) {
            throw new RuntimeException("No rooms found for booking ID: " + request.getBookingId());
        }

        Bookings booking = bookingsRepository.findById(Math.toIntExact(request.getBookingId()))
                .orElseThrow(() -> new RuntimeException("Booking not found: " + request.getBookingId()));
        booking.setStatus(BookingStatus.CHECKOUT);
        booking.setCheckOutTime(LocalDateTime.now());
        bookingsRepository.save(booking);

        LocalDateTime currentTime = LocalDateTime.now();
        queueManager.updateQueue(currentTime);

        HousekeepingSchedule schedule = null;
        for (RoomBookings roomBooking : roomBookings) {
            Room room = roomBooking.getRoom();
            room.setRoomStatus(RoomStatus.CLEANING);
            roomRepository.save(room);

            Long employeeId = queueManager.assignEmployee();
            if (employeeId == null) {
                throw new RuntimeException("No housekeeping employees available");
            }

            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));

            schedule = HousekeepingSchedule.builder()
                    .room(roomBooking.getRoom())
                    .employee(employee)
                    .scheduledTime(currentTime)
                    .status(ScheduleStatus.ASSIGNED)
                    .build();
            housekeepingScheduleRepository.save(schedule);
        }

        return mapToDTO(schedule);
    }

    @Override
    @Transactional
    public HousekeepingScheduleDTO approveHousekeepingRequest(Long requestId) {
        HousekeepingRequest request = housekeepingRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Housekeeping request not found: " + requestId));

        if (request.getStatus() != HousekeepingStatus.PENDING) {
            throw new RuntimeException("Request is not in pending status");
        }

        LocalDateTime currentTime = LocalDateTime.now();
        queueManager.updateQueue(currentTime);

        Long employeeId = queueManager.assignEmployee();
        if (employeeId == null) {
            throw new RuntimeException("No housekeeping employees available");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));

        request.setStatus(HousekeepingStatus.IN_PROGRESS);
        housekeepingRequestRepository.save(request);

        HousekeepingSchedule schedule = HousekeepingSchedule.builder()
                .room(request.getRoom())
                .employee(employee)
                .scheduledTime(currentTime)
                .status(ScheduleStatus.ASSIGNED)
                .build();
        housekeepingScheduleRepository.save(schedule);

        return mapToDTO(schedule);
    }


    @Override
    public Page<HousekeepingScheduleDTO> getHousekeepingSchedules(String roomName, String employeeName, Pageable pageable) {
        return housekeepingScheduleRepository
                .findByRoomNameAndEmployeeFullName(roomName, employeeName, pageable)
                .map(this::mapToDTO);
    }

    @Override
    public Optional<HousekeepingScheduleDTO> getHousekeepingScheduleById(Long id) {
        return housekeepingScheduleRepository.findById(id).map(this::mapToDTO);
    }

    @Override
    public HousekeepingScheduleDTO updateHousekeepingScheduleStatus(Long id, ScheduleStatus status) {
        HousekeepingSchedule schedule = housekeepingScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Housekeeping schedule not found: " + id));
        schedule.setStatus(status);
        return mapToDTO(housekeepingScheduleRepository.save(schedule));
    }

    @Override
    @Transactional
    public void deleteHousekeepingSchedule(Long id) {
        HousekeepingSchedule schedule = housekeepingScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Housekeeping schedule not found: " + id));
        housekeepingScheduleRepository.delete(schedule);
    }

    @Override
    public Page<HousekeepingScheduleDTO> getMyHousekeepingSchedules(UserDetails userDetails, Pageable pageable) {
        Employee employee = employeeRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Employee not found for username: " + userDetails.getUsername()));
        return housekeepingScheduleRepository.findByEmployeeId(employee.getId(), pageable)
                .map(this::mapToDTO);
    }


    private HousekeepingScheduleDTO mapToDTO(HousekeepingSchedule schedule) {
        return HousekeepingScheduleDTO.builder()
                .id(schedule.getId())
                .roomId(schedule.getRoom().getId())
                .roomName(schedule.getRoom().getRoomName())
                .employeeId(schedule.getEmployee().getId())
                .employeeName(schedule.getEmployee().getFullName())
                .scheduleTime(schedule.getScheduledTime())
                .status(schedule.getStatus())
                .build();
    }
}
