package com.example.HMS.dto;

import com.example.HMS.model.Room;
import com.example.HMS.model.RoomAmenity;
import com.example.HMS.model.RoomStatus;
import com.example.HMS.model.RoomType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDTO {
    private Long id;
    private String roomName;
    private String description;
    private String imageUrl;
    private String price;
    private Integer capacity;
    private RoomType roomType;
    private RoomStatus roomStatus;
    private List<RoomAmenityDTO> amenities;
    private List<BookingDTO> bookings;

    public static RoomDTO fromRoom(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setRoomName(room.getRoomName());
        dto.setDescription(room.getDescription());
        dto.setImageUrl(room.getPhotosImagePath());
        dto.setPrice(room.getPrice());
        dto.setCapacity(room.getCapacity());
        dto.setRoomType(room.getRoomType());
        dto.setRoomStatus(room.getRoomStatus());
        dto.setAmenities(fromRoomAmenityList(room.getRoomAmenities()));
        return dto;
    }

    public static List<RoomDTO> fromRoomList(List<Room> rooms) {
        return rooms.stream()
                .map(RoomDTO::fromRoom)
                .collect(Collectors.toList());
    }

    public static RoomAmenityDTO fromRoomAmenity(RoomAmenity roomAmenity) {
        return RoomAmenityDTO.builder()
                .id(roomAmenity.getId())
                .amenityId(roomAmenity.getAmenity().getId())
                .amenityName(roomAmenity.getAmenity().getName())
                .status(roomAmenity.getStatus())
                .quantity(roomAmenity.getQuantity())
                .build();
    }

    public static List<RoomAmenityDTO> fromRoomAmenityList(List<RoomAmenity> roomAmenities) {
        return roomAmenities.stream()
                .map(RoomDTO::fromRoomAmenity)
                .collect(Collectors.toList());
    }
}
