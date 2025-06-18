package com.example.HMS.dto;

import com.example.HMS.model.MaintenanceSchedule;
import com.example.HMS.model.ScheduleStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MaintenanceScheduleDTO {
    private Integer id;
    private Integer assetId;
    private String assetName;
    private Long roomId;
    private String roomName;
    private LocalDateTime scheduleDate;
    private ScheduleStatus status;
    private String description;
    private Set<EmployeeDTO> employees;
}
