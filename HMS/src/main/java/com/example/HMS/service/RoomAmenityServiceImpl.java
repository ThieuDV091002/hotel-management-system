package com.example.HMS.service;

import com.example.HMS.model.Amenity;
import com.example.HMS.model.AmenityStatus;
import com.example.HMS.model.Room;
import com.example.HMS.model.RoomAmenity;
import com.example.HMS.exception.ResourceAlreadyExistsException;
import com.example.HMS.exception.ResourceNotFoundException;
import com.example.HMS.repository.AmenityRepository;
import com.example.HMS.repository.RoomAmenityRepository;
import com.example.HMS.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomAmenityServiceImpl implements RoomAmenityService {
    private final RoomAmenityRepository roomAmenityRepository;
    private final RoomRepository roomRepository;
    private final AmenityRepository amenityRepository;

    @Override
    public List<RoomAmenity> getAllRoomAmenities(Long roomId) {
        roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        return roomAmenityRepository.findByRoomId(roomId);
    }

    @Override
    public RoomAmenity getRoomAmenityById(Long id) {
        return roomAmenityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room amenity not found with id: " + id));
    }

    @Override
    public RoomAmenity addRoomAmenity(Long roomId, Long amenityId, Integer quantity, AmenityStatus status) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        Amenity amenity = amenityRepository.findById(amenityId)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity not found with id: " + amenityId));

        Optional<RoomAmenity> existingRoomAmenity = roomAmenityRepository.findByRoomIdAndAmenityId(roomId, amenityId);
        if (existingRoomAmenity.isPresent()) {
            throw new ResourceAlreadyExistsException("This amenity is already assigned to the room");
        }

        RoomAmenity roomAmenity = new RoomAmenity();
        roomAmenity.setRoom(room);
        roomAmenity.setAmenity(amenity);
        roomAmenity.setQuantity(quantity);
        roomAmenity.setStatus(status);

        return roomAmenityRepository.save(roomAmenity);
    }

    @Override
    public RoomAmenity updateRoomAmenity(Long id, Integer quantity, AmenityStatus status) {
        RoomAmenity roomAmenity = getRoomAmenityById(id);

        if (quantity != null) {
            roomAmenity.setQuantity(quantity);
        }

        if (status != null) {
            roomAmenity.setStatus(status);
        }

        return roomAmenityRepository.save(roomAmenity);
    }

    @Override
    public void deleteRoomAmenity(Long id) {
        RoomAmenity roomAmenity = getRoomAmenityById(id);
        roomAmenityRepository.delete(roomAmenity);
    }

    @Override
    public void updateRoomAmenityStatus(Long id, AmenityStatus status) {
        RoomAmenity roomAmenity = getRoomAmenityById(id);
        roomAmenity.setStatus(status);
        roomAmenityRepository.save(roomAmenity);
    }

    @Override
    public void updateRoomAmenityQuantity(Long id, Integer quantity) {
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        RoomAmenity roomAmenity = getRoomAmenityById(id);
        roomAmenity.setQuantity(quantity);
        roomAmenityRepository.save(roomAmenity);
    }
}
