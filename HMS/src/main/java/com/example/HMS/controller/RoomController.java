package com.example.HMS.controller;

import com.example.HMS.dto.BookingDTO;
import com.example.HMS.dto.RoomAmenityDTO;
import com.example.HMS.dto.RoomDTO;
import com.example.HMS.dto.RoomRequest;
import com.example.HMS.model.*;
import com.example.HMS.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms")
public class RoomController {
    private final RoomService roomService;
    private final ModelMapper modelMapper;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Page<Room> pageRooms = roomService.getAllRooms(page, size);

        List<RoomDTO> roomDTOs = pageRooms.getContent().stream()
                .map(this::convertToRoomDTO)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("rooms", roomDTOs);
        response.put("currentPage", pageRooms.getNumber());
        response.put("totalItems", pageRooms.getTotalElements());
        response.put("totalPages", pageRooms.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Long id) {
        Room room = roomService.getRoomById(id);
        RoomDTO roomDTO = convertToRoomDTO(room);

        List<RoomAmenity> roomAmenities = roomService.getRoomAmenities(id);
        List<RoomAmenityDTO> roomAmenityDTOs = roomAmenities.stream()
                .map(this::convertToRoomAmenityDTO)
                .collect(Collectors.toList());
        roomDTO.setAmenities(roomAmenityDTOs);

        List<RoomBookings> roomBookings = roomService.getRoomBookings(id);
        List<BookingDTO> bookingDTOs = roomBookings.stream()
                .map(rb -> convertToBookingDTO(rb.getBookings()))
                .collect(Collectors.toList());
        roomDTO.setBookings(bookingDTOs);

        return ResponseEntity.ok(roomDTO);
    }

    @PostMapping
    public ResponseEntity<RoomDTO> createRoom(
            @RequestPart("room") RoomRequest roomRequest,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        Room room = new Room();
        room.setRoomName(roomRequest.getRoomName());
        room.setDescription(roomRequest.getDescription());
        room.setPrice(roomRequest.getPrice());
        room.setCapacity(roomRequest.getCapacity());
        room.setRoomType(roomRequest.getRoomType());
        room.setRoomStatus(roomRequest.getRoomStatus());

        Room createdRoom = roomService.createRoom(room, image,
                roomRequest.getAmenityIds(), roomRequest.getQuantities());

        return ResponseEntity.status(HttpStatus.CREATED).body(convertToRoomDTO(createdRoom));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomDTO> updateRoom(
            @PathVariable Long id,
            @RequestPart("room") RoomRequest roomRequest,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        Room roomDetails = new Room();
        roomDetails.setRoomName(roomRequest.getRoomName());
        roomDetails.setDescription(roomRequest.getDescription());
        roomDetails.setPrice(roomRequest.getPrice());
        roomDetails.setCapacity(roomRequest.getCapacity());
        roomDetails.setRoomType(roomRequest.getRoomType());
        roomDetails.setRoomStatus(roomRequest.getRoomStatus());

        Room updatedRoom = roomService.updateRoom(id, roomDetails, image,
                roomRequest.getAmenityIds(), roomRequest.getQuantities());

        return ResponseEntity.ok(convertToRoomDTO(updatedRoom));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);

        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<RoomDTO> updateRoomStatus(
            @PathVariable("id") Long roomId,
            @RequestParam("status") RoomStatus status) {

        Room updatedRoom = roomService.updateRoomStatus(roomId, status);
        RoomDTO roomDTO = convertToRoomDTO(updatedRoom);

        return ResponseEntity.ok(roomDTO);
    }

    @GetMapping("/by-room-types")
    public ResponseEntity<Map<String, Object>> getRoomsByRoomTypePaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Room> roomPage = roomService.getOneRoomPerRoomType(pageable); // Bạn sẽ sửa ở bước 2

        List<RoomDTO> roomDTOs = roomPage.getContent()
                .stream()
                .map(this::convertToRoomDTO)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("rooms", roomDTOs);
        response.put("currentPage", roomPage.getNumber());
        response.put("totalItems", roomPage.getTotalElements());
        response.put("totalPages", roomPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/availability")
    public ResponseEntity<Boolean> areEnoughRoomsAvailable(
            @RequestParam("startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam("roomType") RoomType roomType,
            @RequestParam("numberOfRooms") int numberOfRooms) {
        boolean available = roomService.areEnoughRoomsAvailable(startDate, endDate, roomType, numberOfRooms);
        return ResponseEntity.ok(available);
    }


    private RoomDTO convertToRoomDTO(Room room) {
        RoomDTO roomDTO = modelMapper.map(room, RoomDTO.class);

        if (room.getImage() != null && !room.getImage().isEmpty()) {
            roomDTO.setImageUrl(room.getPhotosImagePath());
        }

        return roomDTO;
    }

    private RoomAmenityDTO convertToRoomAmenityDTO(RoomAmenity roomAmenity) {
        RoomAmenityDTO dto = new RoomAmenityDTO();
        dto.setId(roomAmenity.getId());
        dto.setAmenityId(roomAmenity.getAmenity().getId());
        dto.setAmenityName(roomAmenity.getAmenity().getName());
        dto.setStatus(roomAmenity.getStatus());
        dto.setQuantity(roomAmenity.getQuantity());
        return dto;
    }

    private BookingDTO convertToBookingDTO(Bookings booking) {
        BookingDTO dto = new BookingDTO();
        dto.setCustomerId(booking.getCustomer().getId());
        dto.setCustomerFullName(booking.getCustomer().getFullName());
        dto.setCreatedById(booking.getCreatedBy().getId());
        dto.setCreatedByFullName(booking.getCreatedBy().getFullName());
        dto.setStatus(booking.getStatus());
        dto.setSource(booking.getSource());
        dto.setId(booking.getId());
        dto.setStartDate(booking.getStartDate());
        dto.setEndDate(booking.getEndDate());
        return dto;
    }
}
