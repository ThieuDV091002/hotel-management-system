package com.example.HMS.repository;

import com.example.HMS.model.Room;
import com.example.HMS.model.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query("SELECT DISTINCT r FROM Room r WHERE r.id NOT IN " +
            "(SELECT rb.room.id FROM RoomBookings rb " +
            "JOIN rb.bookings b " +
            "WHERE (b.startDate <= :endDate AND b.endDate >= :startDate) " +
            "AND b.status <> 'CANCELLED')")
    List<Room> findAvailableRooms(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    @Query("SELECT DISTINCT r FROM Room r WHERE r.roomType = :roomType AND r.id NOT IN " +
            "(SELECT rb.room.id FROM RoomBookings rb " +
            "JOIN rb.bookings b " +
            "WHERE (b.startDate <= :endDate AND b.endDate >= :startDate) " +
            "AND b.status <> 'CANCELLED')")
    List<Room> findAvailableRoomsByType(@Param("startDate") Date startDate,
                                        @Param("endDate") Date endDate,
                                        @Param("roomType") RoomType roomType);

    @Query("SELECT r FROM Room r WHERE r.capacity >= :requiredCapacity " +
            "AND r.roomType = :roomType " +
            "AND r.roomStatus = 'AVAILABLE' " +
            "AND r.id NOT IN (" +
            "SELECT rb.room.id FROM RoomBookings rb " +
            "JOIN rb.bookings b " +
            "WHERE b.startDate < :endDate AND b.endDate > :startDate" +
            ") " +
            "ORDER BY CAST(r.price AS integer) ASC")
    List<Room> findAvailableRoomsByCapacityAndTypeOrderByPrice(
            @Param("requiredCapacity") int requiredCapacity,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate,
            @Param("roomType") RoomType roomType);

    Optional<Room> findByRoomName(String roomName);

    @Query(value = """
    SELECT r FROM Room r
    WHERE r.id IN (
        SELECT MIN(r2.id) FROM Room r2 GROUP BY r2.roomType
    )
""")
    Page<Room> findOneRoomPerRoomType(Pageable pageable);
}
