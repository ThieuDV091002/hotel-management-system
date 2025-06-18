package com.example.HMS.service;

import com.example.HMS.dto.GuestDTO;
import org.springframework.data.domain.Page;

public interface GuestService {
    GuestDTO createGuest(GuestDTO guestDTO);
    GuestDTO updateGuest(Long id, GuestDTO guestDTO);
    void deleteGuest(Long id);
    long getCurrentGuestCount();
    Page<GuestDTO> getGuests(Long bookingId, String guestName, Long roomId, int page);
    GuestDTO getGuestById(Long id);
}
