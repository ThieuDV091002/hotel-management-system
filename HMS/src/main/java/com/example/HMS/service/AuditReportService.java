package com.example.HMS.service;

import com.example.HMS.dto.AuditReportDTO;
import com.example.HMS.dto.RealTimeAuditReportDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface AuditReportService {

    AuditReportDTO createAuditReport(LocalDate reportDate);

    Page<AuditReportDTO> getAuditReports(Pageable pageable, LocalDate startDate, LocalDate endDate, String search);

    AuditReportDTO getAuditReportDetails(UUID id);

    RealTimeAuditReportDTO getRealTimeAuditReport(LocalDate reportDate);
}
