package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuestDTO {
    private Long id;
    private Long bookingId;
    private Long roomId;
    private String roomName;
    private String guestName;
    private String guestPhone;
    private String identification;
    private LocalDate startDate;
    private LocalDate endDate;
}
