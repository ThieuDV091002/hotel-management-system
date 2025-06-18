package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDetailsDTO {
    private BookingDTO booking;
    private List<RoomBookingDTO> rooms;
    private List<ServiceUsageDTO> serviceUsages;
}
