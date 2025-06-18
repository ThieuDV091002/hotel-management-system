package com.example.HMS.controller;

import com.example.HMS.dto.FolioDTO;
import com.example.HMS.dto.FolioResponseDTO;
import com.example.HMS.model.FolioStatus;
import com.example.HMS.model.Role;
import com.example.HMS.model.User;
import com.example.HMS.repository.CustomerRepository;
import com.example.HMS.repository.UserRepository;
import com.example.HMS.service.FolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/folios")
@RequiredArgsConstructor
public class FolioController {
    private final FolioService folioService;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @GetMapping
    public Page<FolioDTO> getAllFolios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String search) {
        return folioService.getAllFolios(page, size, search);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<FolioDTO> getFolioByBookingId(@PathVariable Long bookingId) {
        FolioDTO dto = folioService.getFolioByBookingId(bookingId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    public FolioResponseDTO getFolioDetails(
            @PathVariable Long id,
            @RequestParam(required = false) String token,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = null;
        Role role = null;

        if (userDetails != null) {
            userId = getCustomerIdFromUserDetails(userDetails);
            role = getRoleFromUserDetails(userDetails);
        }

        return folioService.getFolioDetails(id, userId, role, token);
    }


    @PostMapping
    public FolioDTO createFolio(@RequestBody Long bookingId) {
        return folioService.createFolio(bookingId);
    }

    @PutMapping("/{id}/status")
    public FolioDTO updateFolioStatus(@PathVariable Long id, @RequestBody FolioStatus status) {
        return folioService.updateFolioStatus(id, status);
    }

    @GetMapping("/user/{userId}")
    public Page<FolioDTO> getUserFolios(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return folioService.getUserFolios(userId, page, size);
    }

    private Long getCustomerIdFromUserDetails(UserDetails userDetails) {
        String username = userDetails.getUsername();
        return customerRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("Customer not found with username: " + username));
    }

    private Role getRoleFromUserDetails(UserDetails userDetails) {
        Optional<User> optionalUser = userRepository.findByUsername(userDetails.getUsername());
        return optionalUser.map(User::getRole).orElse(null);
    }
}
