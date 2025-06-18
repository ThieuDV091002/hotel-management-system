package com.example.HMS.service;

import com.example.HMS.dto.*;
import com.example.HMS.model.BookingStatus;

import java.util.List;

public interface BookingService {
    BookingDTO createBooking(BookingDTO bookingDTO);
    PageResponse<BookingDTO> getCustomerBookings(Long userId, int page, int size);
    PageResponse<BookingDTO> getAllBookings(int page, int size);
    PageResponse<BookingDTO> searchBookings(BookingSearchCriteria criteria, int page, int size);
    void requestOTP(Long bookingId, String token);
    void verifyOTP(Long bookingId, String token, String otp);
    boolean checkOTPStatus(Long bookingId, String token);
    BookingDetailsDTO getBookingDetails(Long bookingId);
    BookingDTO updateBooking(Long bookingId, BookingDTO bookingDTO, String token);
    BookingDTO changeBookingStatus(Long bookingId, BookingStatus status, String token);
    void deleteBooking(Long bookingId);
    void checkIn(Long bookingId);
    List<MonthlyBookingStatsDTO> getMonthlyBookingStats(int year);
    List<BookingDTO> getRecentBookings(int limit);
}
