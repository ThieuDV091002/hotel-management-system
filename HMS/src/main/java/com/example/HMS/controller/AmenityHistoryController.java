package com.example.HMS.controller;

import com.example.HMS.dto.AmenityHistoryCreateRequest;
import com.example.HMS.dto.AmenityHistoryDTO;
import com.example.HMS.dto.AmenityHistoryUpdateRequest;
import com.example.HMS.model.Amenity;
import com.example.HMS.model.AmenityAction;
import com.example.HMS.model.AmenityHistory;
import com.example.HMS.model.Room;
import com.example.HMS.repository.AmenityRepository;
import com.example.HMS.repository.RoomRepository;
import com.example.HMS.service.AmenityHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/amenity-history")
public class AmenityHistoryController {
    private final AmenityHistoryService amenityHistoryService;
    private final RoomRepository roomRepository;
    private final AmenityRepository amenityRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAmenityHistories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<AmenityHistory> pageHistories = amenityHistoryService.getAllAmenityHistories(page, size);
        return buildPaginatedResponse(pageHistories);
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchAmenityHistories(
            @RequestParam(required = false) Long amenityId,
            @RequestParam(required = false) AmenityAction action,
            @RequestParam(required = false) Long sourceRoomId,
            @RequestParam(required = false) Long destinationRoomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<AmenityHistory> pageHistories = amenityHistoryService.findAmenityHistoriesByCriteria(amenityId, action, sourceRoomId, destinationRoomId, page, size);
        return buildPaginatedResponse(pageHistories);
    }

    @GetMapping("/source-room/{roomId}")
    public ResponseEntity<Map<String, Object>> getAmenityHistoriesBySourceRoom(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<AmenityHistory> pageHistories = amenityHistoryService.getAmenityHistoriesBySourceRoom(roomId, page, size);
        return buildPaginatedResponse(pageHistories);
    }

    @GetMapping("/destination-room/{roomId}")
    public ResponseEntity<Map<String, Object>> getAmenityHistoriesByDestinationRoom(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<AmenityHistory> pageHistories = amenityHistoryService.getAmenityHistoriesByDestinationRoom(roomId, page, size);
        return buildPaginatedResponse(pageHistories);
    }

    @GetMapping("/amenity/{amenityId}")
    public ResponseEntity<Map<String, Object>> getAmenityHistoriesByAmenity(
            @PathVariable Long amenityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<AmenityHistory> pageHistories = amenityHistoryService.getAmenityHistoriesByAmenity(amenityId, page, size);
        return buildPaginatedResponse(pageHistories);
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<Map<String, Object>> getAmenityHistoriesByAction(
            @PathVariable AmenityAction action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<AmenityHistory> pageHistories = amenityHistoryService.getAmenityHistoriesByAction(action, page, size);
        return buildPaginatedResponse(pageHistories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AmenityHistoryDTO> getAmenityHistoryById(@PathVariable Long id) {
        AmenityHistory amenityHistory = amenityHistoryService.getAmenityHistoryById(id);
        return ResponseEntity.ok(convertToDTO(amenityHistory));
    }

    @PostMapping
    public ResponseEntity<AmenityHistoryDTO> createAmenityHistory(@RequestBody AmenityHistoryCreateRequest request) {
        AmenityHistory amenityHistory = convertToEntity(request);
        AmenityHistory savedHistory = amenityHistoryService.createAmenityHistory(amenityHistory);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedHistory));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AmenityHistoryDTO> updateAmenityHistory(
            @PathVariable Long id,
            @RequestBody AmenityHistoryUpdateRequest request) {
        AmenityHistory historyDetails = convertToEntity(request);
        AmenityHistory updatedHistory = amenityHistoryService.updateAmenityHistory(id, historyDetails);
        return ResponseEntity.ok(convertToDTO(updatedHistory));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteAmenityHistory(@PathVariable Long id) {
        amenityHistoryService.deleteAmenityHistory(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> buildPaginatedResponse(Page<AmenityHistory> page) {
        List<AmenityHistoryDTO> historyDTOs = page.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        Map<String, Object> response = new HashMap<>();
        response.put("histories", historyDTOs);
        response.put("currentPage", page.getNumber());
        response.put("totalItems", page.getTotalElements());
        response.put("totalPages", page.getTotalPages());
        return ResponseEntity.ok(response);
    }

    private AmenityHistoryDTO convertToDTO(AmenityHistory history) {
        AmenityHistoryDTO dto = new AmenityHistoryDTO();
        dto.setId(history.getId());
        if (history.getSourceRoom() != null) {
            dto.setSourceRoomId(history.getSourceRoom().getId());
            dto.setSourceRoomName(history.getSourceRoom().getRoomName());
        }
        if (history.getDestinationRoom() != null) {
            dto.setDestinationRoomId(history.getDestinationRoom().getId());
            dto.setDestinationRoomName(history.getDestinationRoom().getRoomName());
        }
        dto.setAmenityId(history.getAmenity().getId());
        dto.setAmenityName(history.getAmenity().getName());
        dto.setAction(history.getAction());
        dto.setQuantity(history.getQuantity());
        dto.setTimestamp(history.getTimestamp());
        return dto;
    }

    private AmenityHistory convertToEntity(AmenityHistoryCreateRequest request) {
        AmenityHistory history = new AmenityHistory();
        if (request.getSourceRoomId() != null) {
            Room room = new Room();
            room.setId(request.getSourceRoomId());
            history.setSourceRoom(room);
        }
        if (request.getDestinationRoomId() != null) {
            Room room = new Room();
            room.setId(request.getDestinationRoomId());
            history.setDestinationRoom(room);
        }
        Amenity amenity = new Amenity();
        amenity.setId(request.getAmenityId());
        history.setAmenity(amenity);
        history.setAction(request.getAction());
        history.setQuantity(request.getQuantity());
        if (request.getTimestamp() != null) {
            history.setTimestamp(request.getTimestamp());
        }
        return history;
    }

    private AmenityHistory convertToEntity(AmenityHistoryUpdateRequest request) {
        AmenityHistory history = new AmenityHistory();
        if (request.getSourceRoomId() != null) {
            Room room = new Room();
            room.setId(request.getSourceRoomId());
            history.setSourceRoom(room);
        }
        if (request.getDestinationRoomId() != null) {
            Room room = new Room();
            room.setId(request.getDestinationRoomId());
            history.setDestinationRoom(room);
        }
        if (request.getAmenityId() != null) {
            Amenity amenity = new Amenity();
            amenity.setId(request.getAmenityId());
            history.setAmenity(amenity);
        }
        history.setAction(request.getAction());
        history.setQuantity(request.getQuantity());
        history.setTimestamp(request.getTimestamp());
        return history;
    }
}
