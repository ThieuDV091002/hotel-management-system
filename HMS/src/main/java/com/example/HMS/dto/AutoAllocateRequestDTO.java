package com.example.HMS.dto;

import com.example.HMS.model.RoomType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AutoAllocateRequestDTO {
    private Long bookingId;
    private int roomNumber;
    private RoomType roomType;
    private int totalGuests;
}
