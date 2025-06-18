package com.example.HMS.repository;

import com.example.HMS.model.BookingStatus;
import com.example.HMS.model.Bookings;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Repository
public interface BookingsRepository extends JpaRepository<Bookings, Integer> {
    Page<Bookings> findByCustomerId(Long userId, Pageable pageable);

    @Query("SELECT b FROM Bookings b WHERE " +
            "(:userFullName IS NULL OR LOWER(b.customer.fullName) LIKE LOWER(CONCAT('%', :userFullName, '%'))) AND " +
            "(:startDate IS NULL OR b.startDate >= :startDate) AND " +
            "(:endDate IS NULL OR b.endDate <= :endDate) AND " +
            "(:status IS NULL OR b.status = :status)")
    Page<Bookings> findBySearchCriteria(
            @Param("userFullName") String userFullName,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate,
            @Param("status") BookingStatus status,
            Pageable pageable
    );

    long countByStartDate(Date startDate);

    long countByCheckInTimeBetween(LocalDateTime start, LocalDateTime end);

    long countByCheckOutTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(DISTINCT b.roomNumber) FROM Bookings b")
    long countDistinctRoomNumber();

    @Query("SELECT COUNT(DISTINCT b.roomNumber) FROM Bookings b WHERE :date BETWEEN b.startDate AND b.endDate")
    long countOccupiedRooms(@Param("date") Date date);

    @Query("SELECT COUNT(b) FROM Bookings b WHERE :date BETWEEN b.startDate AND b.endDate")
    long countOccupiedRoomNights(@Param("date") Date date);

    @Query("SELECT MONTH(b.startDate) AS month, COUNT(b) AS bookingCount " +
            "FROM Bookings b " +
            "WHERE YEAR(b.startDate) = :year " +
            "GROUP BY MONTH(b.startDate) " +
            "ORDER BY MONTH(b.startDate)")
    List<Object[]> countBookingsByMonth(@Param("year") int year);
}
