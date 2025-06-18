package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceScheduleUpdateDTO {
    private Integer assetId;
    private Integer roomId;
    private LocalDateTime scheduledDate;
    private String description;
    private Set<Long> employeeIds;
}
