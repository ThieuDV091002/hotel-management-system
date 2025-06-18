package com.example.HMS.service;
import com.example.HMS.dto.EmployeeDTO;
import com.example.HMS.dto.MaintenanceScheduleCreateDTO;
import com.example.HMS.dto.MaintenanceScheduleDTO;
import com.example.HMS.dto.MaintenanceScheduleUpdateDTO;
import com.example.HMS.model.*;
import com.example.HMS.repository.AssetRepository;
import com.example.HMS.repository.EmployeeRepository;
import com.example.HMS.repository.MaintenanceScheduleRepository;
import com.example.HMS.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceScheduleServiceImpl implements MaintenanceScheduleService {

    private final MaintenanceScheduleRepository scheduleRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final RoomRepository roomRepository;

    @Override
    @Transactional
    public MaintenanceScheduleDTO createMaintenanceSchedule(MaintenanceScheduleCreateDTO createDTO) {
        Asset asset = null;
        if (createDTO.getAssetId() != null) {
            asset = assetRepository.findById(createDTO.getAssetId())
                    .orElseThrow(() -> new RuntimeException("Asset not found"));
        }

        Room room = null;
        if (createDTO.getRoomId() != null) {
            room = roomRepository.findById(Long.valueOf(createDTO.getRoomId()))
                    .orElseThrow(() -> new RuntimeException("Room not found"));
        }
        if (asset == null && room == null) {
            throw new RuntimeException("At least one of Asset or Room is required.");
        }
        Set<Employee> employees = new HashSet<>(employeeRepository.findAllById(createDTO.getEmployeeIds()));

        MaintenanceSchedule schedule = MaintenanceSchedule.builder()
                .asset(asset)
                .room(room)
                .scheduledDate(createDTO.getScheduledDate())
                .description(createDTO.getDescription())
                .status(ScheduleStatus.ASSIGNED)
                .employees(employees)
                .build();

        schedule = scheduleRepository.save(schedule);
        return mapToDTO(schedule);
    }

    @Override
    public Page<MaintenanceScheduleDTO> getAllMaintenanceSchedules(Pageable pageable, Integer assetId, Integer roomId, Date startDate, Date endDate) {
        Page<MaintenanceSchedule> schedules;
        if (assetId != null) {
            schedules = scheduleRepository.findByAssetId(assetId, pageable);
        } else if (roomId != null) {
            schedules = scheduleRepository.findByRoomId(roomId, pageable);
        } else if (startDate != null && endDate != null) {
            schedules = scheduleRepository.findByScheduledDateBetween(startDate, endDate, pageable);
        } else {
            schedules = scheduleRepository.findAll(pageable);
        }
        return schedules.map(this::mapToDTO);
    }

    @Override
    public MaintenanceScheduleDTO getMaintenanceScheduleById(Integer id) {
        MaintenanceSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance Schedule not found"));
        return mapToDTO(schedule);
    }

    @Override
    public MaintenanceScheduleDTO updateMaintenanceScheduleStatus(Integer id, ScheduleStatus status){
        MaintenanceSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance Schedule not found"));
        schedule.setStatus(status);
        schedule = scheduleRepository.save(schedule);
        return mapToDTO(schedule);
    }

    @Override
    @Transactional
    public MaintenanceScheduleDTO updateMaintenanceSchedule(Integer id, MaintenanceScheduleUpdateDTO updateDTO) {
        MaintenanceSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance Schedule not found"));

        Asset asset = null;
        if (updateDTO.getAssetId() != null) {
            asset = assetRepository.findById(updateDTO.getAssetId())
                    .orElseThrow(() -> new RuntimeException("Asset not found"));
        }

        Room room = null;
        if (updateDTO.getRoomId() != null) {
            room = roomRepository.findById(Long.valueOf(updateDTO.getRoomId()))
                    .orElseThrow(() -> new RuntimeException("Room not found"));
        }

        Set<Employee> employees = new HashSet<>(employeeRepository.findAllById(updateDTO.getEmployeeIds()));

        schedule.setAsset(asset);
        schedule.setRoom(room);
        schedule.setScheduledDate(updateDTO.getScheduledDate());
        schedule.setDescription(updateDTO.getDescription());
        schedule.setEmployees(employees);

        schedule = scheduleRepository.save(schedule);
        return mapToDTO(schedule);
    }

    @Override
    @Transactional
    public void deleteMaintenanceSchedule(Integer id) {
        MaintenanceSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance Schedule not found"));
        scheduleRepository.delete(schedule);
    }

    @Override
    public List<MaintenanceScheduleDTO> getMaintenanceSchedulesForLoggedInEmployee() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        List<MaintenanceSchedule> schedules = scheduleRepository.findByEmployeeId(employee.getId());
        return schedules.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private MaintenanceScheduleDTO mapToDTO(MaintenanceSchedule schedule) {
        Set<EmployeeDTO> employeeDTOs = schedule.getEmployees().stream()
                .map(e -> new EmployeeDTO(
                        e.getId(),
                        e.getFullName(),
                        e.getUsername(),
                        e.getPassword(),
                        e.getEmail(),
                        e.getPhoneNumber(),
                        e.isActive(),
                        e.getRole(),
                        e.getPosition(),
                        e.getSalary(),
                        e.getHireDate()
                ))
                .collect(Collectors.toSet());

        Integer assetId = schedule.getAsset() != null ? schedule.getAsset().getId() : null;
        String assetName = schedule.getAsset() != null ? schedule.getAsset().getName() : null;

        Long roomId = schedule.getRoom() != null ? schedule.getRoom().getId() : null;
        String roomName = schedule.getRoom() != null ? schedule.getRoom().getRoomName() : null;

        return new MaintenanceScheduleDTO(
                schedule.getId(),
                assetId,
                assetName,
                roomId,
                roomName,
                schedule.getScheduledDate(),
                schedule.getStatus(),
                schedule.getDescription(),
                employeeDTOs
        );
    }
}
