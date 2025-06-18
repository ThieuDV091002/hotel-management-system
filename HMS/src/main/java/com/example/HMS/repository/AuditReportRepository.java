package com.example.HMS.repository;

import com.example.HMS.model.AuditReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.UUID;

@Repository
public interface AuditReportRepository extends JpaRepository<AuditReport, UUID> {

    Page<AuditReport> findByReportDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<AuditReport> findByReportDateContaining(String search, Pageable pageable);
}
