package com.example.HMS.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceScheduleCreateDTO {
    private Integer assetId;
    private Integer roomId;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime scheduledDate;
    private String description;
    private Set<Long> employeeIds;
}
