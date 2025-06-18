package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AllocationResponseDTO {
    private Long bookingId;
    private int totalPrice;
    private List<RoomDTO> allocatedRooms;
}
