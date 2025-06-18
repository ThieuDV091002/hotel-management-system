package com.example.HMS.service;

import com.example.HMS.exception.ResourceNotFoundException;
import com.example.HMS.model.Amenity;
import com.example.HMS.model.AmenityAction;
import com.example.HMS.model.AmenityHistory;
import com.example.HMS.model.Room;
import com.example.HMS.repository.AmenityHistoryRepository;
import com.example.HMS.repository.AmenityRepository;
import com.example.HMS.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AmenityHistoryServiceImpl implements AmenityHistoryService {
    private final AmenityHistoryRepository amenityHistoryRepository;
    private final RoomRepository roomRepository;
    private final AmenityRepository amenityRepository;

    @Override
    public Page<AmenityHistory> getAllAmenityHistories(int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("timestamp").descending());
        return amenityHistoryRepository.findAll(pageable);
    }

    @Override
    public Page<AmenityHistory> getAmenityHistoriesBySourceRoom(Long roomId, int pageNo, int pageSize) {
        roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("timestamp").descending());
        return amenityHistoryRepository.findBySourceRoomId(roomId, pageable);
    }

    @Override
    public Page<AmenityHistory> getAmenityHistoriesByDestinationRoom(Long roomId, int pageNo, int pageSize) {
        roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("timestamp").descending());
        return amenityHistoryRepository.findByDestinationRoomId(roomId, pageable);
    }

    @Override
    public Page<AmenityHistory> getAmenityHistoriesByAmenity(Long amenityId, int pageNo, int pageSize) {
        amenityRepository.findById(amenityId)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity not found with id: " + amenityId));
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("timestamp").descending());
        return amenityHistoryRepository.findByAmenityId(amenityId, pageable);
    }

    @Override
    public Page<AmenityHistory> getAmenityHistoriesByAction(AmenityAction action, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("timestamp").descending());
        return amenityHistoryRepository.findByAction(action, pageable);
    }

    @Override
    public Page<AmenityHistory> findAmenityHistoriesByCriteria(Long amenityId, AmenityAction action, Long sourceRoomId, Long destinationRoomId, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("timestamp").descending());
        return amenityHistoryRepository.findByCriteria(amenityId, action, sourceRoomId, destinationRoomId, pageable);
    }

    @Override
    public AmenityHistory getAmenityHistoryById(Long id) {
        return amenityHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity history not found with id: " + id));
    }

    @Override
    public AmenityHistory createAmenityHistory(AmenityHistory amenityHistory) {
        if (amenityHistory.getAmenity() == null || amenityHistory.getAmenity().getId() == null) {
            throw new IllegalArgumentException("Amenity is required");
        }
        Long amenityId = amenityHistory.getAmenity().getId();
        Amenity amenity = amenityRepository.findById(amenityId)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity not found with id: " + amenityId));
        amenityHistory.setAmenity(amenity);

        if (amenityHistory.getSourceRoom() != null && amenityHistory.getSourceRoom().getId() != null) {
            Long roomId = amenityHistory.getSourceRoom().getId();
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new ResourceNotFoundException("Source room not found with id: " + roomId));
            amenityHistory.setSourceRoom(room);
        }

        if (amenityHistory.getDestinationRoom() != null && amenityHistory.getDestinationRoom().getId() != null) {
            Long roomId = amenityHistory.getDestinationRoom().getId();
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new ResourceNotFoundException("Destination room not found with id: " + roomId));
            amenityHistory.setDestinationRoom(room);
        }

        if (amenityHistory.getTimestamp() == null) {
            amenityHistory.setTimestamp(LocalDateTime.now());
        }

        if (amenityHistory.getAction() == null) {
            throw new IllegalArgumentException("Action is required");
        }

        if (amenityHistory.getQuantity() == null || amenityHistory.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        return amenityHistoryRepository.save(amenityHistory);
    }

    @Override
    public AmenityHistory updateAmenityHistory(Long id, AmenityHistory historyDetails) {
        AmenityHistory existingHistory = getAmenityHistoryById(id);

        if (historyDetails.getAmenity() != null && historyDetails.getAmenity().getId() != null) {
            Long amenityId = historyDetails.getAmenity().getId();
            Amenity amenity = amenityRepository.findById(amenityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Amenity not found with id: " + amenityId));
            existingHistory.setAmenity(amenity);
        }

        if (historyDetails.getSourceRoom() != null && historyDetails.getSourceRoom().getId() != null) {
            Long roomId = historyDetails.getSourceRoom().getId();
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new ResourceNotFoundException("Source room not found with id: " + roomId));
            existingHistory.setSourceRoom(room);
        } else if (historyDetails.getSourceRoom() != null && historyDetails.getSourceRoom().getId() == null) {
            existingHistory.setSourceRoom(null);
        }

        if (historyDetails.getDestinationRoom() != null && historyDetails.getDestinationRoom().getId() != null) {
            Long roomId = historyDetails.getDestinationRoom().getId();
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new ResourceNotFoundException("Destination room not found with id: " + roomId));
            existingHistory.setDestinationRoom(room);
        } else if (historyDetails.getDestinationRoom() != null && historyDetails.getDestinationRoom().getId() == null) {
            existingHistory.setDestinationRoom(null);
        }

        if (historyDetails.getAction() != null) {
            existingHistory.setAction(historyDetails.getAction());
        }

        if (historyDetails.getQuantity() != null) {
            if (historyDetails.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be positive");
            }
            existingHistory.setQuantity(historyDetails.getQuantity());
        }

        if (historyDetails.getTimestamp() != null) {
            existingHistory.setTimestamp(historyDetails.getTimestamp());
        }

        return amenityHistoryRepository.save(existingHistory);
    }

    @Override
    public void deleteAmenityHistory(Long id) {
        AmenityHistory amenityHistory = getAmenityHistoryById(id);
        amenityHistoryRepository.delete(amenityHistory);
    }
}
