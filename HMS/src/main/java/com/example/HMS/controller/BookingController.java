package com.example.HMS.controller;

import com.example.HMS.dto.*;
import com.example.HMS.model.*;
import com.example.HMS.repository.AccessTokenRepository;
import com.example.HMS.repository.BookingsRepository;
import com.example.HMS.repository.UserRepository;
import com.example.HMS.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;
    private final BookingsRepository bookingRepository;
    private final AccessTokenRepository accessTokenRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@RequestBody BookingDTO bookingDTO,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            String username = userDetails.getUsername();
            Optional<User> optionalUser = userRepository.findByUsername(username);

            if (optionalUser.isPresent()) {
                User user = optionalUser.get();
                bookingDTO.setCreatedById(user.getId());

                if (user instanceof Customer) {
                    bookingDTO.setCustomerId(user.getId());
                }
            }
        }
        BookingDTO createdBooking = bookingService.createBooking(bookingDTO);
        return new ResponseEntity<>(createdBooking, HttpStatus.CREATED);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<PageResponse<BookingDTO>> getCustomerBookings(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        PageResponse<BookingDTO> bookings = bookingService.getCustomerBookings(customerId, page, size);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingDetailsDTO> getBookingDetails(
            @PathVariable Long bookingId,
            @RequestParam(required = false) String token,
            @AuthenticationPrincipal UserDetails userDetails) {

        Bookings booking = bookingRepository.findById(Math.toIntExact(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (userDetails != null) {
            String username = userDetails.getUsername();
            Optional<User> optionalUser = userRepository.findByUsername(username);
            if (optionalUser.isPresent()) {
                User user = optionalUser.get();
                if (user.getRole() != Role.ADMIN && user.getRole() != Role.RECEPTIONIST) {
                    if (booking.getCustomer() == null || !booking.getCustomer().getId().equals(user.getId())) {
                        throw new RuntimeException("You can only view your own bookings");
                    }
                }
            } else {
                throw new RuntimeException("User not found");
            }
        } else {
            if (token == null) {
                throw new IllegalArgumentException("Token is required for guest users");
            }
            accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, bookingId, "BOOKING")
                    .filter(t -> !t.getExpiresAt().isBefore(LocalDateTime.now()))
                    .filter(t -> t.getGuestEmail().equals(booking.getGuestEmail()))
                    .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        }

        BookingDetailsDTO bookingDetails = bookingService.getBookingDetails(bookingId);
        return ResponseEntity.ok(bookingDetails);
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<BookingDTO> updateBooking(@PathVariable Long bookingId,
                                                    @RequestBody BookingDTO bookingDTO,
                                                    @RequestParam(required = false) String token,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        Bookings booking = bookingRepository.findById(Math.toIntExact(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (userDetails != null) {
            String username = userDetails.getUsername();
            Optional<User> optionalUser = userRepository.findByUsername(username);
            if (optionalUser.isEmpty()) {
                throw new RuntimeException("User not found");
            }

            User user = optionalUser.get();
            Role role = user.getRole();

            if (role != Role.ADMIN && role != Role.RECEPTIONIST) {
                if (booking.getCustomer() == null || !booking.getCustomer().getId().equals(user.getId())) {
                    throw new RuntimeException("Forbidden: You can only update your own bookings");
                }
            }
        } else {
            if (token == null) {
                throw new RuntimeException("Token is required for guest users");
            }

            accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, bookingId, "BOOKING")
                    .filter(t -> !t.getExpiresAt().isBefore(LocalDateTime.now()))
                    .filter(t -> t.getGuestEmail().equals(booking.getGuestEmail()))
                    .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        }

        BookingDTO updatedBooking = bookingService.updateBooking(bookingId, bookingDTO, token);
        return ResponseEntity.ok(updatedBooking);
    }


    @PutMapping("/{bookingId}/change-status")
    public ResponseEntity<BookingDTO> changeBookingStatus(@PathVariable Long bookingId,
                                                          @RequestBody BookingStatus status,
                                                          @RequestParam(required = false) String token,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        Bookings booking = bookingRepository.findById(Math.toIntExact(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (userDetails != null) {
            String username = userDetails.getUsername();
            Optional<User> optionalUser = userRepository.findByUsername(username);
            if (optionalUser.isEmpty()) {
                throw new RuntimeException("User not found");
            }

            User user = optionalUser.get();
            Role role = user.getRole();

            if (role != Role.ADMIN && role != Role.RECEPTIONIST) {
                if (booking.getCustomer() == null || !booking.getCustomer().getId().equals(user.getId())) {
                    throw new RuntimeException("Forbidden: You can only change status of your own bookings");
                }
            }
        } else {
            if (token == null) {
                throw new RuntimeException("Token is required for guest users");
            }

            accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, bookingId, "BOOKING")
                    .filter(t -> !t.getExpiresAt().isBefore(LocalDateTime.now()))
                    .filter(t -> t.getGuestEmail().equals(booking.getGuestEmail()))
                    .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        }

        BookingDTO updatedBooking = bookingService.changeBookingStatus(bookingId, status, token);
        return ResponseEntity.ok(updatedBooking);
    }

    @PostMapping("/{id}/request-otp")
    public ResponseEntity<String> requestOTP(@PathVariable Long id, @RequestParam String token) {
        bookingService.requestOTP(id, token);
        return ResponseEntity.ok("OTP sent to your email");
    }

    @PostMapping("/{id}/verify-otp")
    public ResponseEntity<String> verifyOTP(@PathVariable Long id,
                                            @RequestParam String token,
                                            @RequestParam String otp) {
        bookingService.verifyOTP(id, token, otp);
        return ResponseEntity.ok("OTP verified successfully");
    }

    @GetMapping("/{id}/otp-status")
    public ResponseEntity<Boolean> checkOTPStatus(@PathVariable Long id, @RequestParam String token) {
        boolean isVerified = bookingService.checkOTPStatus(id, token);
        return ResponseEntity.ok(isVerified);
    }

    @PostMapping("/{bookingId}/check-in")
    public ResponseEntity<Void> checkIn(@PathVariable Long bookingId) {
        bookingService.checkIn(bookingId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin")
    public ResponseEntity<PageResponse<BookingDTO>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PageResponse<BookingDTO> bookings = bookingService.getAllBookings(page, size);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/admin/search")
    public ResponseEntity<PageResponse<BookingDTO>> searchBookings(
            @RequestParam(required = false) String customerFullName,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        BookingSearchCriteria criteria = new BookingSearchCriteria();
        criteria.setUserFullName(customerFullName);
        criteria.setStartDate(startDate);
        criteria.setEndDate(endDate);
        criteria.setStatus(status);

        PageResponse<BookingDTO> bookings = bookingService.searchBookings(criteria, page, size);
        return ResponseEntity.ok(bookings);
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long bookingId) {
        bookingService.deleteBooking(bookingId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recent")
    public ResponseEntity<List<BookingDTO>> getRecentBookings(
            @RequestParam(defaultValue = "10") int limit) {
        List<BookingDTO> bookings = bookingService.getRecentBookings(limit);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/monthly-bookings")
    public ResponseEntity<List<MonthlyBookingStatsDTO>> getMonthlyBookingStats(
            @RequestParam(defaultValue = "2025") int year) {
        List<MonthlyBookingStatsDTO> stats = bookingService.getMonthlyBookingStats(year);
        return ResponseEntity.ok(stats);
    }
}
