package com.example.HMS.controller;

import com.example.HMS.dto.AllocationResponseDTO;
import com.example.HMS.dto.AutoAllocateRequestDTO;
import com.example.HMS.dto.ManualAllocateRequestDTO;
import com.example.HMS.dto.RoomBookingDTO;
import com.example.HMS.service.RoomAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room-allocations")
@RequiredArgsConstructor
public class RoomAllocationController {
    private final RoomAllocationService roomAllocationService;

    @PostMapping("/auto-allocate")
    public ResponseEntity<AllocationResponseDTO> autoAllocateRooms(@RequestBody AutoAllocateRequestDTO request) {
        AllocationResponseDTO response = roomAllocationService.autoAllocateRooms(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/manual-allocate")
    public ResponseEntity<AllocationResponseDTO> manualAllocateRooms(@RequestBody ManualAllocateRequestDTO request) {
        AllocationResponseDTO response = roomAllocationService.manualAllocateRooms(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<RoomBookingDTO>> getBookingRooms(@PathVariable Long bookingId) {
        List<RoomBookingDTO> rooms = roomAllocationService.getBookingRooms(bookingId);
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/booking/{bookingId}/room")
    public ResponseEntity<RoomBookingDTO> addRoomToBooking(
            @PathVariable Long bookingId,
            @RequestBody Long roomId) {
        RoomBookingDTO roomBooking = roomAllocationService.addRoomToBooking(bookingId, roomId);
        return new ResponseEntity<>(roomBooking, HttpStatus.CREATED);
    }

    @DeleteMapping("/room-booking/{roomBookingId}")
    public ResponseEntity<Void> removeRoomFromBooking(@PathVariable Long roomBookingId) {
        roomAllocationService.removeRoomFromBooking(roomBookingId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/room-booking/{roomBookingId}/room")
    public ResponseEntity<Void> updateRoomBooking(
            @PathVariable Long roomBookingId,
            @RequestBody Long newRoomId) {
        roomAllocationService.updateRoomBooking(roomBookingId, newRoomId);
        return ResponseEntity.ok().build();
    }
}
