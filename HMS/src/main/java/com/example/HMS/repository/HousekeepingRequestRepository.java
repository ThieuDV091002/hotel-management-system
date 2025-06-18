package com.example.HMS.repository;

import com.example.HMS.model.HousekeepingRequest;
import com.example.HMS.model.HousekeepingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HousekeepingRequestRepository extends JpaRepository<HousekeepingRequest, Long> {
    Page<HousekeepingRequest> findByCustomerId(Long customerId, Pageable pageable);
    Page<HousekeepingRequest> findByCustomerIdAndStatus(Long customerId, HousekeepingStatus status, Pageable pageable);
    Page<HousekeepingRequest> findByStatus(HousekeepingStatus status, Pageable pageable);
    Page<HousekeepingRequest> findByRoomId(Long roomId, Pageable pageable);

    @Query("SELECT h FROM HousekeepingRequest h " +
            "WHERE (:customerName IS NULL OR h.customer.fullName LIKE CONCAT('%', :customerName, '%')) " +
            "AND (:roomName IS NULL OR h.room.roomName LIKE CONCAT('%', :roomName, '%'))")
    Page<HousekeepingRequest> findWithFilters(
            @Param("customerName") String customerName,
            @Param("roomName") String roomName,
            Pageable pageable);
}
