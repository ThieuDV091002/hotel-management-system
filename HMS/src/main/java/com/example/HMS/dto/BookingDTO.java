package com.example.HMS.dto;

import com.example.HMS.model.BookingSource;
import com.example.HMS.model.BookingStatus;
import com.example.HMS.model.RoomType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    private Long customerId;
    private Long createdById;
    private String customerFullName;
    private String createdByFullName;
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private BookingSource source;
    private BookingStatus status;
    private int totalPrice;
    private Date startDate;
    private Date endDate;
    private RoomType roomType;
    private int roomNumber;
    private int adultNumber;
    private int childNumber;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private int numberOfDays;
    private List<Long> roomIds;
    private List<Long> serviceUsageIds;
}
