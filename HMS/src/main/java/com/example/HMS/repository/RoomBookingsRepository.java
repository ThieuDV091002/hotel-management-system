package com.example.HMS.repository;

import com.example.HMS.model.RoomBookings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomBookingsRepository extends JpaRepository<RoomBookings, Long> {
    List<RoomBookings> findByBookingsId(Long bookingId);
    List<RoomBookings> findByRoomId(Long roomId);

    @Query("DELETE FROM RoomBookings rb WHERE rb.bookings.id = :bookingId")
    void deleteByBookingId(@Param("bookingId") Long bookingId);
}
