package com.example.HMS.service;

import com.example.HMS.dto.*;
import com.example.HMS.model.Bookings;
import com.example.HMS.model.Room;
import com.example.HMS.model.RoomBookings;
import com.example.HMS.model.RoomType;
import com.example.HMS.repository.BookingsRepository;
import com.example.HMS.repository.RoomBookingsRepository;
import com.example.HMS.repository.RoomRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomAllocationServiceImpl implements RoomAllocationService {
    private final BookingsRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final RoomBookingsRepository roomBookingRepository;

    @Override
    @Transactional
    public AllocationResponseDTO autoAllocateRooms(AutoAllocateRequestDTO request) {
        Bookings booking = bookingRepository.findById(Math.toIntExact(request.getBookingId()))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        int totalGuests = request.getTotalGuests() > 0 ?
                request.getTotalGuests() :
                booking.getAdultNumber() + booking.getChildNumber();

        int requestedRoomNumber = request.getRoomNumber();
        if (requestedRoomNumber <= 0) {
            throw new IllegalArgumentException("Requested room number must be positive");
        }

        RoomType requestedRoomType = request.getRoomType();
        if (requestedRoomType == null) {
            throw new IllegalArgumentException("Room type must be specified");
        }

        long durationMillis = booking.getEndDate().getTime() - booking.getStartDate().getTime();
        int days = (int) TimeUnit.DAYS.convert(durationMillis, TimeUnit.MILLISECONDS);
        if (days < 1) days = 1;

        List<RoomBookings> existingRoomBookings = roomBookingRepository.findByBookingsId(booking.getId());
        roomBookingRepository.deleteAll(existingRoomBookings);

        List<Room> availableRooms = roomRepository.findAvailableRoomsByCapacityAndTypeOrderByPrice(
                1, // Start with minimum capacity
                booking.getStartDate(),
                booking.getEndDate(),
                requestedRoomType
        );

        List<Room> allocatedRooms = new ArrayList<>();
        int remainingGuests = totalGuests;
        int totalPrice = 0;

        List<Room> sortedRooms = availableRooms.stream()
                .sorted((r1, r2) -> {
                    int priceCompare = Integer.compare(
                            Integer.parseInt(r1.getPrice()),
                            Integer.parseInt(r2.getPrice())
                    );
                    if (priceCompare != 0) return priceCompare;
                    return Integer.compare(r2.getCapacity(), r1.getCapacity());
                })
                .collect(Collectors.toList());

        if (sortedRooms.size() < requestedRoomNumber) {
            throw new RuntimeException("Not enough available rooms of type " + requestedRoomType + " to meet the requested room number");
        }

        int maxCapacity = sortedRooms.stream()
                .limit(requestedRoomNumber)
                .mapToInt(Room::getCapacity)
                .sum();
        if (maxCapacity < totalGuests) {
            throw new RuntimeException("Requested number of rooms of type " + requestedRoomType + " cannot accommodate all guests");
        }

        for (Room room : sortedRooms) {
            if (allocatedRooms.size() >= requestedRoomNumber) break;

            allocatedRooms.add(room);
            remainingGuests -= room.getCapacity();
            totalPrice += Integer.parseInt(room.getPrice()) * days;

            RoomBookings roomBooking = new RoomBookings();
            roomBooking.setRoom(room);
            roomBooking.setBookings(booking);
            roomBookingRepository.save(roomBooking);
        }

        if (remainingGuests > 0) {
            throw new RuntimeException("Allocated rooms of type " + requestedRoomType + " cannot accommodate all guests");
        }

        booking.setTotalPrice(totalPrice);
        booking.setRoomNumber(allocatedRooms.size());
        bookingRepository.save(booking);

        AllocationResponseDTO response = new AllocationResponseDTO();
        response.setBookingId(booking.getId());
        response.setTotalPrice(totalPrice);
        response.setAllocatedRooms(allocatedRooms.stream()
                .map(this::mapRoomToDTO)
                .collect(Collectors.toList()));

        return response;
    }

    @Override
    @Transactional
    public AllocationResponseDTO manualAllocateRooms(ManualAllocateRequestDTO request) {
        Bookings booking = bookingRepository.findById(Math.toIntExact(request.getBookingId()))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        long durationMillis = booking.getEndDate().getTime() - booking.getStartDate().getTime();
        int days = (int) TimeUnit.DAYS.convert(durationMillis, TimeUnit.MILLISECONDS);
        if (days < 1) days = 1;

        List<Room> availableRooms = roomRepository.findAvailableRooms(
                booking.getStartDate(),
                booking.getEndDate()
        );

        List<Long> availableRoomIds = availableRooms.stream()
                .map(Room::getId)
                .collect(Collectors.toList());

        for (Long roomId : request.getRoomIds()) {
            if (!availableRoomIds.contains(roomId)) {
                throw new RuntimeException("Room with ID " + roomId + " is not available for the selected dates");
            }
        }

        List<RoomBookings> existingRoomBookings = roomBookingRepository.findByBookingsId(booking.getId());
        roomBookingRepository.deleteAll(existingRoomBookings);

        List<Room> allocatedRooms = new ArrayList<>();
        int totalPrice = 0;

        for (Long roomId : request.getRoomIds()) {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found"));

            allocatedRooms.add(room);
            totalPrice += Integer.parseInt(room.getPrice()) * days;

            RoomBookings roomBooking = new RoomBookings();
            roomBooking.setRoom(room);
            roomBooking.setBookings(booking);
            roomBookingRepository.save(roomBooking);
        }

        booking.setTotalPrice(totalPrice);
        booking.setRoomNumber(allocatedRooms.size());
        bookingRepository.save(booking);

        AllocationResponseDTO response = new AllocationResponseDTO();
        response.setBookingId(booking.getId());
        response.setTotalPrice(totalPrice);
        response.setAllocatedRooms(allocatedRooms.stream()
                .map(this::mapRoomToDTO)
                .collect(Collectors.toList()));

        return response;
    }

    @Override
    public List<RoomBookingDTO> getBookingRooms(Long bookingId) {
        List<RoomBookings> roomBookings = roomBookingRepository.findByBookingsId(bookingId);
        return roomBookings.stream()
                .map(this::mapRoomBookingToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoomBookingDTO addRoomToBooking(Long bookingId, Long roomId) {
        Bookings booking = bookingRepository.findById(Math.toIntExact(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        List<Room> availableRooms = roomRepository.findAvailableRooms(
                booking.getStartDate(),
                booking.getEndDate()
        );

        boolean isAvailable = availableRooms.stream()
                .anyMatch(r -> r.getId().equals(roomId));

        if (!isAvailable) {
            throw new RuntimeException("Room is not available for the selected dates");
        }

        long durationMillis = booking.getEndDate().getTime() - booking.getStartDate().getTime();
        int days = (int) TimeUnit.DAYS.convert(durationMillis, TimeUnit.MILLISECONDS);
        if (days < 1) days = 1;

        RoomBookings roomBooking = new RoomBookings();
        roomBooking.setRoom(room);
        roomBooking.setBookings(booking);
        RoomBookings savedRoomBooking = roomBookingRepository.save(roomBooking);

        int additionalPrice = Integer.parseInt(room.getPrice()) * days;
        booking.setTotalPrice(booking.getTotalPrice() + additionalPrice);
        booking.setRoomNumber(booking.getRoomNumber() + 1);
        bookingRepository.save(booking);

        return mapRoomBookingToDTO(savedRoomBooking);
    }

    @Override
    @Transactional
    public void removeRoomFromBooking(Long roomBookingId) {
        RoomBookings roomBooking = roomBookingRepository.findById(roomBookingId)
                .orElseThrow(() -> new RuntimeException("Room booking not found"));

        Bookings booking = roomBooking.getBookings();
        Room room = roomBooking.getRoom();

        long durationMillis = booking.getEndDate().getTime() - booking.getStartDate().getTime();
        int days = (int) TimeUnit.DAYS.convert(durationMillis, TimeUnit.MILLISECONDS);
        if (days < 1) days = 1;

        roomBookingRepository.delete(roomBooking);

        int priceReduction = Integer.parseInt(room.getPrice()) * days;
        booking.setTotalPrice(Math.max(0, booking.getTotalPrice() - priceReduction));
        booking.setRoomNumber(booking.getRoomNumber() - 1);
        bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public void updateRoomBooking(Long roomBookingId, Long newRoomId) {
        RoomBookings roomBooking = roomBookingRepository.findById(roomBookingId)
                .orElseThrow(() -> new RuntimeException("Room booking not found"));

        Room newRoom = roomRepository.findById(newRoomId)
                .orElseThrow(() -> new RuntimeException("New room not found"));

        Bookings booking = roomBooking.getBookings();
        Room oldRoom = roomBooking.getRoom();

        List<Room> availableRooms = roomRepository.findAvailableRooms(
                booking.getStartDate(),
                booking.getEndDate()
        );

        boolean isAvailable = availableRooms.stream()
                .anyMatch(r -> r.getId().equals(newRoomId));

        if (!isAvailable) {
            throw new RuntimeException("New room is not available for the selected dates");
        }

        long durationMillis = booking.getEndDate().getTime() - booking.getStartDate().getTime();
        int days = (int) TimeUnit.DAYS.convert(durationMillis, TimeUnit.MILLISECONDS);
        if (days < 1) days = 1;

        roomBooking.setRoom(newRoom);
        roomBookingRepository.save(roomBooking);

        int priceDifference = (Integer.parseInt(newRoom.getPrice()) - Integer.parseInt(oldRoom.getPrice())) * days;
        booking.setTotalPrice(booking.getTotalPrice() + priceDifference);
        bookingRepository.save(booking);
    }

    private RoomDTO mapRoomToDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setRoomName(room.getRoomName());
        dto.setRoomType(room.getRoomType());
        dto.setPrice(room.getPrice());
        dto.setCapacity(room.getCapacity());
        dto.setRoomStatus(room.getRoomStatus());
        return dto;
    }

    private RoomBookingDTO mapRoomBookingToDTO(RoomBookings roomBooking) {
        RoomBookingDTO dto = new RoomBookingDTO();
        dto.setId(roomBooking.getId());
        dto.setRoomId(roomBooking.getRoom().getId());
        dto.setRoomType(roomBooking.getRoom().getRoomType());
        dto.setPricePerNight(Integer.parseInt(roomBooking.getRoom().getPrice()));
        dto.setBookingId(roomBooking.getBookings().getId());
        return dto;
    }
}
