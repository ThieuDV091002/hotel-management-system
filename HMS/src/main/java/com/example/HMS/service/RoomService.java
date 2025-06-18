package com.example.HMS.service;

import com.example.HMS.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;

public interface RoomService {
    Page<Room> getAllRooms(int pageNo, int pageSize);
    Room getRoomById(Long id);
    Room createRoom(Room room, MultipartFile image, List<Long> amenityIds, List<Integer> quantities);
    Room updateRoom(Long id, Room roomDetails, MultipartFile image, List<Long> amenityIds, List<Integer> quantities);
    void deleteRoom(Long id);
    List<RoomAmenity> getRoomAmenities(Long roomId);
    List<RoomBookings> getRoomBookings(Long roomId);
    List<Room> findAvailableRooms(Date startDate, Date endDate);
    List<Room> findAvailableRoomsByType(Date startDate, Date endDate, RoomType roomType);
    Room updateRoomStatus(Long roomId, RoomStatus status);
    Page<Room> getOneRoomPerRoomType(Pageable pageable);
    boolean areEnoughRoomsAvailable(Date startDate, Date endDate, RoomType roomType, int numberOfRooms);
}
