package com.example.HMS.repository;

import com.example.HMS.model.MaintenanceSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, Integer> {
    Page<MaintenanceSchedule> findByAssetId(Integer assetId, Pageable pageable);
    Page<MaintenanceSchedule> findByRoomId(Integer roomId, Pageable pageable);
    Page<MaintenanceSchedule> findByScheduledDateBetween(Date startDate, Date endDate, Pageable pageable);

    @Query("SELECT ms FROM MaintenanceSchedule ms JOIN ms.employees e WHERE e.id = :employeeId")
    List<MaintenanceSchedule> findByEmployeeId(@Param("employeeId") Long employeeId);
}
