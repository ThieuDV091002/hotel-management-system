package com.example.HMS.service;

import com.example.HMS.dto.GuestDTO;
import com.example.HMS.model.Bookings;
import com.example.HMS.model.Guests;
import com.example.HMS.model.Room;
import com.example.HMS.repository.BookingsRepository;
import com.example.HMS.repository.GuestRepository;
import com.example.HMS.repository.RoomRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class GuestServiceImpl implements GuestService {
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;
    private final BookingsRepository bookingsRepository;

    @Override
    @Transactional
    public GuestDTO createGuest(GuestDTO guestDTO) {
        Bookings booking = bookingsRepository.findById(Math.toIntExact(guestDTO.getBookingId()))
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        Room room = roomRepository.findById(guestDTO.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Guests guest = new Guests();
        guest.setBookings(booking);
        guest.setRoom(room);
        guest.setGuestName(guestDTO.getGuestName());
        guest.setGuestPhone(guestDTO.getGuestPhone());
        guest.setIdentification(guestDTO.getIdentification());

        guest = guestRepository.save(guest);
        return convertToDTO(guest);
    }

    @Override
    @Transactional
    public GuestDTO updateGuest(Long id, GuestDTO guestDTO) {
        Guests guest = guestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        Bookings booking = bookingsRepository.findById(Math.toIntExact(guestDTO.getBookingId()))
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        Room room = roomRepository.findById(guestDTO.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        guest.setBookings(booking);
        guest.setRoom(room);
        guest.setGuestName(guestDTO.getGuestName());
        guest.setGuestPhone(guestDTO.getGuestPhone());
        guest.setIdentification(guestDTO.getIdentification());

        guest = guestRepository.save(guest);
        return convertToDTO(guest);
    }

    @Override
    @Transactional
    public void deleteGuest(Long id) {
        if (!guestRepository.existsById(id)) {
            throw new RuntimeException("Guest not found");
        }
        guestRepository.deleteById(id);
    }

    @Override
    public Page<GuestDTO> getGuests(Long bookingId, String guestName, Long roomId, int page) {
        PageRequest pageRequest = PageRequest.of(page, 15);
        Page<Guests> guests;

        if (bookingId != null || guestName != null || roomId != null) {
            guests = guestRepository.findByCriteria(bookingId, guestName, roomId, pageRequest);
        } else {
            guests = guestRepository.findAll(pageRequest);
        }

        return guests.map(this::convertToDTO);
    }

    @Override
    public long getCurrentGuestCount() {
        return guestRepository.countGuestsCurrentlyStaying();
    }

    @Override
    public GuestDTO getGuestById(Long id) {
        Guests guest = guestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guest not found"));
        return convertToDTO(guest);
    }

    private GuestDTO convertToDTO(Guests guest) {
        GuestDTO dto = new GuestDTO();
        dto.setId(guest.getId());
        dto.setBookingId(guest.getBookings().getId());
        dto.setRoomId(guest.getRoom().getId());
        dto.setRoomName(guest.getRoom().getRoomName()); // Assuming Room has a name field
        dto.setGuestName(guest.getGuestName());
        dto.setGuestPhone(guest.getGuestPhone());
        dto.setIdentification(guest.getIdentification());
        dto.setStartDate(guest.getBookings().getStartDate().toInstant()
                .atZone(ZoneId.systemDefault()).toLocalDate());
        dto.setEndDate(guest.getBookings().getEndDate().toInstant()
                .atZone(ZoneId.systemDefault()).toLocalDate());
        return dto;
    }
}
