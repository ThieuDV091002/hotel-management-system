package com.example.HMS.service;

import com.example.HMS.model.*;
import com.example.HMS.exception.ResourceNotFoundException;
import com.example.HMS.repository.AmenityRepository;
import com.example.HMS.repository.RoomAmenityRepository;
import com.example.HMS.repository.RoomBookingsRepository;
import com.example.HMS.repository.RoomRepository;
import com.example.HMS.utils.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {
    private final RoomRepository roomRepository;
    private final RoomBookingsRepository roomBookingsRepository;
    private final AmenityRepository amenityRepository;
    private final RoomAmenityRepository roomAmenityRepository;
    private static final String ROOM_PHOTOS_DIR = "../room-photos/";

    @Override
    public Page<Room> getAllRooms(int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        return roomRepository.findAll(pageable);
    }

    @Override
    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
    }

    @Override
    public Room updateRoomStatus(Long roomId, RoomStatus status) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id " + roomId));

        room.setRoomStatus(status);
        return roomRepository.save(room);
    }

    @Override
    public Room createRoom(Room room, MultipartFile image, List<Long> amenityIds, List<Integer> quantities) {
        Room savedRoom = roomRepository.save(room);

        if (image != null && !image.isEmpty()) {
            try {
                String fileName = StringUtils.cleanPath(image.getOriginalFilename());
                savedRoom.setImage(fileName);
                savedRoom = roomRepository.save(savedRoom);

                String uploadDir = ROOM_PHOTOS_DIR + savedRoom.getId();
                FileUploadUtil.saveFile(uploadDir, fileName, image);
            } catch (IOException e) {
                throw new RuntimeException("Could not store file", e);
            }
        }

        if (amenityIds != null && quantities != null && amenityIds.size() == quantities.size()) {
            for (int i = 0; i < amenityIds.size(); i++) {
                Long amenityId = amenityIds.get(i);
                Integer quantity = quantities.get(i);

                Amenity amenity = amenityRepository.findById(amenityId)
                        .orElseThrow(() -> new ResourceNotFoundException("Amenity not found with id: " + amenityId));

                RoomAmenity roomAmenity = new RoomAmenity();
                roomAmenity.setRoom(savedRoom);
                roomAmenity.setAmenity(amenity);
                roomAmenity.setQuantity(quantity);
                roomAmenity.setStatus(AmenityStatus.WORKING);

                roomAmenityRepository.save(roomAmenity);
            }
        }

        return savedRoom;
    }

    @Override
    public Room updateRoom(Long id, Room roomDetails, MultipartFile image, List<Long> amenityIds, List<Integer> quantities) {
        Room room = getRoomById(id);

        room.setRoomName(roomDetails.getRoomName());
        room.setDescription(roomDetails.getDescription());
        room.setPrice(roomDetails.getPrice());
        room.setCapacity(roomDetails.getCapacity());
        room.setRoomType(roomDetails.getRoomType());
        room.setRoomStatus(roomDetails.getRoomStatus());

        if (image != null && !image.isEmpty()) {
            try {
                String fileName = StringUtils.cleanPath(image.getOriginalFilename());
                String uploadDir = ROOM_PHOTOS_DIR + id;

                if (room.getImage() != null && !room.getImage().isEmpty()) {
                    FileUploadUtil.cleanDir(uploadDir);
                }

                room.setImage(fileName);
                FileUploadUtil.saveFile(uploadDir, fileName, image);
            } catch (IOException e) {
                throw new RuntimeException("Could not store file", e);
            }
        }

        Room updatedRoom = roomRepository.save(room);

        if (amenityIds != null && quantities != null && amenityIds.size() == quantities.size()) {

            List<RoomAmenity> existingAmenities = roomAmenityRepository.findByRoomId(id);
            roomAmenityRepository.deleteAll(existingAmenities);

            for (int i = 0; i < amenityIds.size(); i++) {
                Long amenityId = amenityIds.get(i);
                Integer quantity = quantities.get(i);

                Amenity amenity = amenityRepository.findById(amenityId)
                        .orElseThrow(() -> new ResourceNotFoundException("Amenity not found with id: " + amenityId));

                RoomAmenity roomAmenity = new RoomAmenity();
                roomAmenity.setRoom(updatedRoom);
                roomAmenity.setAmenity(amenity);
                roomAmenity.setQuantity(quantity);
                roomAmenity.setStatus(AmenityStatus.WORKING);

                roomAmenityRepository.save(roomAmenity);
            }
        }

        return updatedRoom;
    }

    @Override
    public void deleteRoom(Long id) {
        Room room = getRoomById(id);

        String uploadDir = ROOM_PHOTOS_DIR + id;
        try {
            FileUploadUtil.cleanDir(uploadDir);
            Files.deleteIfExists(Paths.get(uploadDir));
        } catch (IOException e) {
            System.err.println("Could not delete room image directory: " + e.getMessage());
        }

        roomRepository.delete(room);
    }

    @Override
    public List<RoomAmenity> getRoomAmenities(Long roomId) {
        getRoomById(roomId);
        return roomAmenityRepository.findByRoomId(roomId);
    }

    @Override
    public List<RoomBookings> getRoomBookings(Long roomId) {
        return roomBookingsRepository.findByRoomId(roomId);
    }

    @Override
    public List<Room> findAvailableRooms(Date startDate, Date endDate) {
        validateDateRange(startDate, endDate);
        return roomRepository.findAvailableRooms(startDate, endDate);
    }

    @Override
    public List<Room> findAvailableRoomsByType(Date startDate, Date endDate, RoomType roomType) {
        validateDateRange(startDate, endDate);

        if (roomType == null) {
            return findAvailableRooms(startDate, endDate);
        }

        return roomRepository.findAvailableRoomsByType(startDate, endDate, roomType);
    }

    @Override
    public Page<Room> getOneRoomPerRoomType(Pageable pageable) {
        return roomRepository.findOneRoomPerRoomType(pageable);
    }

    @Override
    public boolean areEnoughRoomsAvailable(Date startDate, Date endDate, RoomType roomType, int numberOfRooms) {
        if (startDate == null || endDate == null || roomType == null || numberOfRooms <= 0) {
            return false;
        }
        List<Room> availableRooms = findAvailableRoomsByType(startDate, endDate, roomType);
        return availableRooms.size() >= numberOfRooms;
    }

    private void validateDateRange(Date startDate, Date endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date must be provided");
        }

        if (startDate.after(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date today = cal.getTime();
        if (startDate.before(today)) {
            throw new IllegalArgumentException("Start date must be in the future");
        }
    }
}
