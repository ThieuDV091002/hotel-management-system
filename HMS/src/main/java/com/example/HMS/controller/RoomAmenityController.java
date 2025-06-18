package com.example.HMS.controller;

import com.example.HMS.dto.QuantityUpdateRequest;
import com.example.HMS.dto.RoomAmenityRequest;
import com.example.HMS.dto.RoomAmenityUpdateRequest;
import com.example.HMS.dto.StatusUpdateRequest;
import com.example.HMS.model.RoomAmenity;
import com.example.HMS.dto.RoomAmenityDTO;
import com.example.HMS.exception.ResourceNotFoundException;
import com.example.HMS.service.RoomAmenityService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/rooms/{roomId}/amenities")
public class RoomAmenityController {
    private final RoomAmenityService roomAmenityService;
    private final ModelMapper modelMapper;

    @GetMapping
    public ResponseEntity<List<RoomAmenityDTO>> getAllRoomAmenities(@PathVariable Long roomId) {
        List<RoomAmenity> roomAmenities = roomAmenityService.getAllRoomAmenities(roomId);

        List<RoomAmenityDTO> roomAmenityDTOs = roomAmenities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(roomAmenityDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomAmenityDTO> getRoomAmenityById(@PathVariable Long roomId, @PathVariable Long id) {
        RoomAmenity roomAmenity = roomAmenityService.getRoomAmenityById(id);

        if (!roomAmenity.getRoom().getId().equals(roomId)) {
            throw new ResourceNotFoundException("Room amenity not found for this room");
        }

        return ResponseEntity.ok(convertToDTO(roomAmenity));
    }

    @PostMapping
    public ResponseEntity<RoomAmenityDTO> addRoomAmenity(
            @PathVariable Long roomId,
            @RequestBody RoomAmenityRequest request) {

        RoomAmenity roomAmenity = roomAmenityService.addRoomAmenity(
                roomId,
                request.getAmenityId(),
                request.getQuantity(),
                request.getStatus());

        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(roomAmenity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomAmenityDTO> updateRoomAmenity(
            @PathVariable Long roomId,
            @PathVariable Long id,
            @RequestBody RoomAmenityUpdateRequest request) {

        RoomAmenity roomAmenity = roomAmenityService.getRoomAmenityById(id);

        if (!roomAmenity.getRoom().getId().equals(roomId)) {
            throw new ResourceNotFoundException("Room amenity not found for this room");
        }

        roomAmenity = roomAmenityService.updateRoomAmenity(id, request.getQuantity(), request.getStatus());

        return ResponseEntity.ok(convertToDTO(roomAmenity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteRoomAmenity(
            @PathVariable Long roomId,
            @PathVariable Long id) {

        RoomAmenity roomAmenity = roomAmenityService.getRoomAmenityById(id);

        if (!roomAmenity.getRoom().getId().equals(roomId)) {
            throw new ResourceNotFoundException("Room amenity not found for this room");
        }

        roomAmenityService.deleteRoomAmenity(id);

        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RoomAmenityDTO> updateRoomAmenityStatus(
            @PathVariable Long roomId,
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {

        RoomAmenity roomAmenity = roomAmenityService.getRoomAmenityById(id);

        if (!roomAmenity.getRoom().getId().equals(roomId)) {
            throw new ResourceNotFoundException("Room amenity not found for this room");
        }

        roomAmenityService.updateRoomAmenityStatus(id, request.getStatus());

        // Fetch updated entity
        roomAmenity = roomAmenityService.getRoomAmenityById(id);

        return ResponseEntity.ok(convertToDTO(roomAmenity));
    }

    @PatchMapping("/{id}/quantity")
    public ResponseEntity<RoomAmenityDTO> updateRoomAmenityQuantity(
            @PathVariable Long roomId,
            @PathVariable Long id,
            @RequestBody QuantityUpdateRequest request) {

        RoomAmenity roomAmenity = roomAmenityService.getRoomAmenityById(id);

        if (!roomAmenity.getRoom().getId().equals(roomId)) {
            throw new ResourceNotFoundException("Room amenity not found for this room");
        }

        roomAmenityService.updateRoomAmenityQuantity(id, request.getQuantity());

        roomAmenity = roomAmenityService.getRoomAmenityById(id);

        return ResponseEntity.ok(convertToDTO(roomAmenity));
    }

    private RoomAmenityDTO convertToDTO(RoomAmenity roomAmenity) {
        RoomAmenityDTO dto = new RoomAmenityDTO();
        dto.setId(roomAmenity.getId());
        dto.setAmenityId(roomAmenity.getAmenity().getId());
        dto.setAmenityName(roomAmenity.getAmenity().getName());
        dto.setStatus(roomAmenity.getStatus());
        dto.setQuantity(roomAmenity.getQuantity());
        return dto;
    }
}
