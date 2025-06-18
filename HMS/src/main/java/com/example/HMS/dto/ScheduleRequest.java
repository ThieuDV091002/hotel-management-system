package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private Long employeeId;
    private String shift;
    private LocalDate scheduleDate;
}
