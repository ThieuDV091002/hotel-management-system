package com.example.HMS.service;

import com.example.HMS.dto.AuditReportDTO;
import com.example.HMS.dto.RealTimeAuditReportDTO;
import com.example.HMS.model.*;
import com.example.HMS.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditReportServiceImpl implements AuditReportService {
    private final AuditReportRepository auditReportRepository;
    private final BookingsRepository bookingsRepository;
    private final FolioRepository folioRepository;
    private final InventoryReceiptRepository inventoryReceiptRepository;
    private final OperatingExpenseRepository operatingExpensesRepository;
    private final SalaryRepository salaryRepository;

    @Override
    @Transactional
    public AuditReportDTO createAuditReport(LocalDate reportDate) {
        if (reportDate == null) {
            throw new IllegalArgumentException("reportDate cannot be null");
        }

        AuditReport report = new AuditReport();
        report.setReportDate(reportDate);
        report.setCreatedAt(LocalDateTime.now());

        Date reportDateAsDate = Date.from(reportDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

        long numberOfBookings = bookingsRepository.countByStartDate(reportDateAsDate);
        report.setNumberOfBookings(numberOfBookings);

        long checkIns = bookingsRepository.countByCheckInTimeBetween(
                reportDate.atStartOfDay(), reportDate.atTime(23, 59, 59));
        long checkOuts = bookingsRepository.countByCheckOutTimeBetween(
                reportDate.atStartOfDay(), reportDate.atTime(23, 59, 59));
        report.setCheckIns(checkIns);
        report.setCheckOuts(checkOuts);

        double revenue = folioRepository.findByCreatedAtBetweenAndStatus(
                        reportDate.atStartOfDay(), reportDate.atTime(23, 59, 59), FolioStatus.PAID)
                .stream().mapToDouble(Folio::getTotalAmount).sum();
        report.setRevenue(revenue);

        double inventoryExpenses = inventoryReceiptRepository.findByReceiptDateBetween(
                        reportDate.atStartOfDay(), reportDate.atTime(23, 59, 59))
                .stream().mapToDouble(InventoryReceipt::getTotalAmount).sum();
        double operatingExpenses = operatingExpensesRepository.findByCreatedAtBetween(
                        reportDate.atStartOfDay(), reportDate.atTime(23, 59, 59))
                .stream().mapToDouble(OperatingExpenses::getAmount).sum();
        double salaryExpenses = salaryRepository.findByPayTimeBetween(
                        reportDate.atStartOfDay(), reportDate.atTime(23, 59, 59))
                .stream().mapToDouble(Salary::getAmount).sum();
        double totalExpenses = inventoryExpenses + operatingExpenses + salaryExpenses;
        report.setExpenses(totalExpenses);

        long totalRooms = bookingsRepository.countDistinctRoomNumber();
        long occupiedRooms = bookingsRepository.countOccupiedRooms(reportDateAsDate); // Use Date
        double occupancyRate = totalRooms > 0 ? (double) occupiedRooms / totalRooms * 100 : 0;
        report.setOccupancyRate(occupancyRate);

        report.setRoomCapacity(totalRooms);

        long occupiedRoomNights = bookingsRepository.countOccupiedRoomNights(reportDateAsDate); // Use Date
        double adr = occupiedRoomNights > 0 ? revenue / occupiedRoomNights : 0;
        report.setAdr(adr);

        double revPar = totalRooms > 0 ? revenue / totalRooms : 0;
        report.setRevPar(revPar);

        auditReportRepository.save(report);
        return mapToDTO(report);
    }

    @Override
    public Page<AuditReportDTO> getAuditReports(Pageable pageable, LocalDate startDate, LocalDate endDate, String search) {
        Page<AuditReport> reports;
        if (startDate != null && endDate != null) {
            reports = auditReportRepository.findByReportDateBetween(startDate, endDate, pageable);
        } else if (search != null && !search.isEmpty()) {
            reports = auditReportRepository.findByReportDateContaining(search, pageable);
        } else {
            reports = auditReportRepository.findAll(pageable);
        }
        return reports.map(this::mapToDTO);
    }

    @Override
    public AuditReportDTO getAuditReportDetails(UUID id) {
        AuditReport report = auditReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Audit Report not found"));
        return mapToDTO(report);
    }

    @Override
    @Transactional(readOnly = true)
    public RealTimeAuditReportDTO getRealTimeAuditReport(LocalDate reportDate) {
        RealTimeAuditReportDTO dto = new RealTimeAuditReportDTO();
        dto.setReportDate(reportDate);
        LocalDateTime now = LocalDateTime.now();

        Date reportDateAsDate = Date.from(reportDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
        long numberOfBookings = bookingsRepository.countByStartDate(reportDateAsDate);
        dto.setNumberOfBookings(numberOfBookings);

        long checkIns = bookingsRepository.countByCheckInTimeBetween(
                reportDate.atStartOfDay(), now);
        long checkOuts = bookingsRepository.countByCheckOutTimeBetween(
                reportDate.atStartOfDay(), now);
        dto.setCheckIns(checkIns);
        dto.setCheckOuts(checkOuts);

        double revenue = folioRepository.findByCreatedAtBetweenAndStatus(
                        reportDate.atStartOfDay(), now, FolioStatus.PAID)
                .stream().mapToDouble(Folio::getTotalAmount).sum();
        dto.setRevenue(revenue);

        double inventoryExpenses = inventoryReceiptRepository.findByReceiptDateBetween(
                        reportDate.atStartOfDay(), now)
                .stream().mapToDouble(InventoryReceipt::getTotalAmount).sum();
        double operatingExpenses = operatingExpensesRepository.findByCreatedAtBetween(
                        reportDate.atStartOfDay(), now)
                .stream().mapToDouble(OperatingExpenses::getAmount).sum();
        double salaryExpenses = salaryRepository.findByPayTimeBetween(
                        reportDate.atStartOfDay(), now)
                .stream().mapToDouble(Salary::getAmount).sum();
        double totalExpenses = inventoryExpenses + operatingExpenses + salaryExpenses;
        dto.setExpenses(totalExpenses);

        long totalRooms = bookingsRepository.countDistinctRoomNumber();
        long occupiedRooms = bookingsRepository.countOccupiedRooms(reportDateAsDate);
        double occupancyRate = totalRooms > 0 ? (double) occupiedRooms / totalRooms * 100 : 0;
        dto.setOccupancyRate(occupancyRate);

        dto.setRoomCapacity(totalRooms);

        long occupiedRoomNights = bookingsRepository.countOccupiedRoomNights(reportDateAsDate);
        double adr = occupiedRoomNights > 0 ? revenue / occupiedRoomNights : 0;
        dto.setAdr(adr);

        double revPar = totalRooms > 0 ? revenue / totalRooms : 0;
        dto.setRevPar(revPar);

        dto.setUpdatedAt(now);
        return dto;
    }

    private AuditReportDTO mapToDTO(AuditReport report) {
        AuditReportDTO dto = new AuditReportDTO();
        dto.setId(report.getId());
        dto.setReportDate(report.getReportDate());
        dto.setNumberOfBookings(report.getNumberOfBookings());
        dto.setCheckIns(report.getCheckIns());
        dto.setCheckOuts(report.getCheckOuts());
        dto.setRevenue(report.getRevenue());
        dto.setExpenses(report.getExpenses());
        dto.setOccupancyRate(report.getOccupancyRate());
        dto.setRoomCapacity(report.getRoomCapacity());
        dto.setAdr(report.getAdr());
        dto.setRevPar(report.getRevPar());
        dto.setCreatedAt(report.getCreatedAt());
        return dto;
    }
}
