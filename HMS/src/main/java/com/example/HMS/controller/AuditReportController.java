package com.example.HMS.controller;

import com.example.HMS.dto.AuditReportDTO;
import com.example.HMS.dto.AuditReportRequestDTO;
import com.example.HMS.dto.RealTimeAuditReportDTO;
import com.example.HMS.service.AuditReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/audit-reports")
public class AuditReportController {
    private final AuditReportService auditReportService;

    @PostMapping
    public ResponseEntity<AuditReportDTO> createAuditReport(@RequestBody AuditReportRequestDTO requestDTO) {
        AuditReportDTO report = auditReportService.createAuditReport(requestDTO.getReportDate());
        return ResponseEntity.ok(report);
    }

    @GetMapping
    public ResponseEntity<Page<AuditReportDTO>> getAuditReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditReportDTO> reports = auditReportService.getAuditReports(pageable, startDate, endDate, search);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditReportDTO> getAuditReportDetails(@PathVariable UUID id) {
        AuditReportDTO report = auditReportService.getAuditReportDetails(id);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/real-time")
    public ResponseEntity<RealTimeAuditReportDTO> getRealTimeAuditReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate reportDate) {
        RealTimeAuditReportDTO report = auditReportService.getRealTimeAuditReport(reportDate);
        return ResponseEntity.ok(report);
    }
}
