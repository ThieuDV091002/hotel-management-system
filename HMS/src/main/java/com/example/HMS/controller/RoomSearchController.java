package com.example.HMS.controller;

import com.example.HMS.model.Room;
import com.example.HMS.dto.RoomDTO;
import com.example.HMS.model.RoomType;
import com.example.HMS.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms/search")
public class RoomSearchController {
    private final RoomService roomService;

    @GetMapping("")
    public ResponseEntity<?> searchAvailableRooms(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam(required = false) String roomType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        try {
            RoomType type = null;
            if (roomType != null && !roomType.isEmpty()) {
                try {
                    type = RoomType.valueOf(roomType.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("Invalid room type: " + roomType);
                }
            }

            List<Room> availableRooms = (type != null)
                    ? roomService.findAvailableRoomsByType(startDate, endDate, type)
                    : roomService.findAvailableRooms(startDate, endDate);

            List<RoomDTO> roomDTOs = RoomDTO.fromRoomList(availableRooms);

            int total = roomDTOs.size();
            int fromIndex = Math.min(page * size, total);
            int toIndex = Math.min(fromIndex + size, total);
            List<RoomDTO> paginatedRooms = roomDTOs.subList(fromIndex, toIndex);

            Map<String, Object> response = new HashMap<>();
            response.put("startDate", startDate);
            response.put("endDate", endDate);
            if (type != null) response.put("roomType", type.toString());
            response.put("availableRooms", paginatedRooms);
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("totalItems", total);
            response.put("totalPages", (int) Math.ceil((double) total / size));

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error searching for available rooms: " + e.getMessage());
        }
    }


    @GetMapping("/room-types")
    public ResponseEntity<?> getRoomTypes() {
        List<Map<String, Object>> roomTypes = new ArrayList<>();

        for (RoomType type : RoomType.values()) {
            Map<String, Object> typeInfo = new HashMap<>();
            typeInfo.put("code", type.name());
            typeInfo.put("name", formatRoomTypeName(type.name()));
            roomTypes.add(typeInfo);
        }

        return ResponseEntity.ok(roomTypes);
    }

    private String formatRoomTypeName(String name) {
        return name.substring(0, 1) + name.substring(1).toLowerCase().replace("_", " ");
    }
}
