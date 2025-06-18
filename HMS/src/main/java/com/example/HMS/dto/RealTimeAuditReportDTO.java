package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RealTimeAuditReportDTO {
    private LocalDate reportDate;
    private long numberOfBookings;
    private long checkIns;
    private long checkOuts;
    private double revenue;
    private double expenses;
    private double occupancyRate;
    private long roomCapacity;
    private double adr;
    private double revPar;
    private LocalDateTime updatedAt;
}
