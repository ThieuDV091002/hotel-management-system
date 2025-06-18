package com.example.HMS.dto;

import com.example.HMS.model.RoomType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomBookingDTO {
    private Long id;
    private Long roomId;
    private String roomNumber;
    private RoomType roomType;
    private int pricePerNight;
    private Long bookingId;
}
