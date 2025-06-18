package com.example.HMS.service;

import com.example.HMS.dto.MaintenanceScheduleCreateDTO;
import com.example.HMS.dto.MaintenanceScheduleDTO;
import com.example.HMS.dto.MaintenanceScheduleUpdateDTO;
import com.example.HMS.model.MaintenanceSchedule;
import com.example.HMS.model.ScheduleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Date;
import java.util.List;

public interface MaintenanceScheduleService {
    MaintenanceScheduleDTO createMaintenanceSchedule(MaintenanceScheduleCreateDTO createDTO);
    Page<MaintenanceScheduleDTO> getAllMaintenanceSchedules(Pageable pageable, Integer assetId, Integer roomId, Date startDate, Date endDate);
    MaintenanceScheduleDTO getMaintenanceScheduleById(Integer id);
    MaintenanceScheduleDTO updateMaintenanceSchedule(Integer id, MaintenanceScheduleUpdateDTO updateDTO);
    MaintenanceScheduleDTO updateMaintenanceScheduleStatus(Integer id, ScheduleStatus status);
    void deleteMaintenanceSchedule(Integer id);
    List<MaintenanceScheduleDTO> getMaintenanceSchedulesForLoggedInEmployee();
}
