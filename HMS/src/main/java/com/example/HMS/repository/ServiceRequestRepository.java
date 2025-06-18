package com.example.HMS.repository;

import com.example.HMS.model.ServiceRequest;
import com.example.HMS.model.ServiceRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    Page<ServiceRequest> findByBookingCustomerId(Long customerId, Pageable pageable);
    Page<ServiceRequest> findByBookingCustomerIdAndStatus(Long customerId, ServiceRequestStatus status, Pageable pageable);
    Page<ServiceRequest> findByStatus(ServiceRequestStatus status, Pageable pageable);
    Page<ServiceRequest> findByBookingId(Long bookingId, Pageable pageable);

    @Query("SELECT sr FROM ServiceRequest sr " +
            "WHERE (:serviceName IS NULL OR sr.service.serviceName LIKE CONCAT('%', :serviceName, '%'))")
    Page<ServiceRequest> findWithFilters(
            @Param("serviceName") String serviceName,
            Pageable pageable);
}
