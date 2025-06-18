package com.example.HMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuditReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
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

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
