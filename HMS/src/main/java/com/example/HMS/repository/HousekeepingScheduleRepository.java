package com.example.HMS.repository;

import com.example.HMS.model.HousekeepingSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HousekeepingScheduleRepository extends JpaRepository<HousekeepingSchedule, Long> {
    @Query("SELECT hs FROM HousekeepingSchedule hs " +
            "WHERE (:roomName IS NULL OR hs.room.roomName LIKE CONCAT('%', :roomName, '%')) " +
            "AND (:employeeName IS NULL OR hs.employee.fullName LIKE CONCAT('%', :employeeName, '%'))")
    Page<HousekeepingSchedule> findByRoomNameAndEmployeeFullName(
            @Param("roomName") String roomName,
            @Param("employeeName") String employeeName,
            Pageable pageable);

    Page<HousekeepingSchedule> findByEmployeeId(Long employeeId, Pageable pageable);
}
