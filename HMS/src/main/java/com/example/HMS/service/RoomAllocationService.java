package com.example.HMS.service;


import com.example.HMS.dto.AllocationResponseDTO;
import com.example.HMS.dto.AutoAllocateRequestDTO;
import com.example.HMS.dto.ManualAllocateRequestDTO;
import com.example.HMS.dto.RoomBookingDTO;

import java.util.List;

public interface RoomAllocationService {
    AllocationResponseDTO autoAllocateRooms(AutoAllocateRequestDTO request);
    AllocationResponseDTO manualAllocateRooms(ManualAllocateRequestDTO request);
    List<RoomBookingDTO> getBookingRooms(Long bookingId);
    RoomBookingDTO addRoomToBooking(Long bookingId, Long roomId);
    void removeRoomFromBooking(Long roomBookingId);
    void updateRoomBooking(Long roomBookingId, Long newRoomId);
}
