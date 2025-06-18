package com.example.HMS.dto;

import com.example.HMS.model.ScheduleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HousekeepingScheduleDTO {
    private Long id;
    private Long roomId;
    private String roomName;
    private Long employeeId;
    private String employeeName;
    private ScheduleStatus status;
    private LocalDateTime scheduleTime;
}
