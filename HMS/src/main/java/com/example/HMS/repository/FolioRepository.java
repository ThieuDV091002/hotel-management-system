package com.example.HMS.repository;

import com.example.HMS.model.Folio;
import com.example.HMS.model.FolioStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FolioRepository extends JpaRepository<Folio, Long>, JpaSpecificationExecutor<Folio> {
    Page<Folio> findByUserId(Long userId, Pageable pageable);
    List<Folio> findByCreatedAtBetweenAndStatus(LocalDateTime start, LocalDateTime end, FolioStatus status);
    Optional<Folio> findByBookingsId(Long bookingId);
}

