package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeSchedule {
    private Long employeeId;
    private String fullName;
    private String position;
    private List<ScheduleResponse> workSchedules;
}
