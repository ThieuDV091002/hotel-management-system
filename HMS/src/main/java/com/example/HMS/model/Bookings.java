package com.example.HMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Bookings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = true)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = true)
    private User createdBy;

    private String guestName;
    private String guestEmail;
    private String guestPhone;

    @Enumerated(EnumType.STRING)
    private BookingSource source;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private int totalPrice;

    private Date startDate;
    private Date endDate;
    @Enumerated(EnumType.STRING)
    private RoomType roomType;
    private int roomNumber;
    private int adultNumber;
    private int childNumber;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    @OneToMany(mappedBy = "bookings", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RoomBookings> roomBookings = new ArrayList<>();

    @OneToMany(mappedBy = "bookings", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ServiceUsage> serviceUsages = new ArrayList<>();
}
