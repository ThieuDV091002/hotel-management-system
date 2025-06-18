package com.example.HMS.repository;

import com.example.HMS.model.Guests;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GuestRepository extends JpaRepository<Guests, Long> {

    @Query("SELECT g FROM Guests g WHERE " +
            "(:bookingId IS NULL OR g.bookings.id = :bookingId) AND " +
            "(:guestName IS NULL OR g.guestName LIKE CONCAT('%', :guestName, '%')) AND " +
            "(:roomId IS NULL OR g.room.id = :roomId)")
    Page<Guests> findByCriteria(
            @Param("bookingId") Long bookingId,
            @Param("guestName") String guestName,
            @Param("roomId") Long roomId,
            Pageable pageable);

    @Query("""
        SELECT COUNT(g) 
        FROM Guests g 
        WHERE g.bookings.checkInTime <= CURRENT_TIMESTAMP 
          AND g.bookings.checkOutTime > CURRENT_TIMESTAMP
    """)
    long countGuestsCurrentlyStaying();
}
