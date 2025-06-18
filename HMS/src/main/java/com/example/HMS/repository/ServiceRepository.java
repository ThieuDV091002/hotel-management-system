package com.example.HMS.repository;

import com.example.HMS.model.Services;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<Services, Long> {

    @Query("SELECT s FROM Services s WHERE " +
            "(:serviceName IS NULL OR s.serviceName LIKE %:serviceName%) AND " +
            "(:serviceType IS NULL OR s.serviceType LIKE %:serviceType%)")
    Page<Services> findByCriteria(
            @Param("serviceName") String serviceName,
            @Param("serviceType") String serviceType,
            Pageable pageable);
}
