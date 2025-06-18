package com.example.HMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class ServiceUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Bookings bookings;
    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Services services;
    private int quantity;
    private double totalPrice;
    private LocalDateTime timestamp;
}
