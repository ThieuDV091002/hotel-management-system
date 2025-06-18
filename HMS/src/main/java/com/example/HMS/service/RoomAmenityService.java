package com.example.HMS.service;

import com.example.HMS.model.AmenityStatus;
import com.example.HMS.model.RoomAmenity;

import java.util.List;

public interface RoomAmenityService {
    List<RoomAmenity> getAllRoomAmenities(Long roomId);
    RoomAmenity getRoomAmenityById(Long id);
    RoomAmenity addRoomAmenity(Long roomId, Long amenityId, Integer quantity, AmenityStatus status);
    RoomAmenity updateRoomAmenity(Long id, Integer quantity, AmenityStatus status);
    void deleteRoomAmenity(Long id);
    void updateRoomAmenityStatus(Long id, AmenityStatus status);
    void updateRoomAmenityQuantity(Long id, Integer quantity);
}
