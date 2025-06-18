package com.example.HMS.controller;

import com.example.HMS.dto.GuestDTO;
import com.example.HMS.service.GuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/guests")
public class GuestController {
    private final GuestService guestService;

    @PostMapping
    public ResponseEntity<GuestDTO> createGuest(@RequestBody GuestDTO guestDTO) {
        return ResponseEntity.ok(guestService.createGuest(guestDTO));
    }

    @GetMapping("/current-count")
    public ResponseEntity<Long> getCurrentGuestCount() {
        long count = guestService.getCurrentGuestCount();
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GuestDTO> updateGuest(@PathVariable Long id, @RequestBody GuestDTO guestDTO) {
        return ResponseEntity.ok(guestService.updateGuest(id, guestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteGuest(@PathVariable Long id) {
        guestService.deleteGuest(id);
        return ResponseEntity.ok("Guest deleted successfully");
    }

    @GetMapping
    public ResponseEntity<Page<GuestDTO>> getGuests(
            @RequestParam(required = false) Long bookingId,
            @RequestParam(required = false) String guestName,
            @RequestParam(required = false) Long roomId,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(guestService.getGuests(bookingId, guestName, roomId, page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuestDTO> getGuestById(@PathVariable Long id) {
        return ResponseEntity.ok(guestService.getGuestById(id));
    }
}
