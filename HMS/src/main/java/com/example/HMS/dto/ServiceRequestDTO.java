package com.example.HMS.dto;

import com.example.HMS.model.ServiceRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ServiceRequestDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long bookingId;
    private Long serviceId;
    private String serviceName;
    private String guestName;
    private String guestEmail;
    private Integer quantity;
    private Double totalAmount;
    private ServiceRequestStatus status;
    private String notes;
    private LocalDateTime createdAt;
}
