package com.example.HMS.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ServiceUsageDTO {
    private Long id;

    @NotNull(message = "Service ID cannot be null")
    private Long serviceId;
    private Long bookingId;

    private String serviceName;

    @NotNull(message = "Quantity cannot be null")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    @NotNull(message = "Total price cannot be null")
    @PositiveOrZero(message = "Total price must be positive or zero")
    private Double totalPrice;

    private LocalDateTime timestamp;
}
