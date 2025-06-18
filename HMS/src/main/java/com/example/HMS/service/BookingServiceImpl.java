package com.example.HMS.service;

import com.example.HMS.dto.*;
import com.example.HMS.model.*;
import com.example.HMS.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    private final BookingsRepository bookingRepository;
    private final RoomBookingsRepository roomBookingRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final ServiceUsageRepository serviceUsageRepository;
    private final AccessTokenRepository accessTokenRepository;
    private final OTPRepository otpRepository;
    private final JavaMailSender mailSender;

    @Override
    @Transactional
    public BookingDTO createBooking(BookingDTO bookingDTO) {
        long diffInMillies = Math.abs(bookingDTO.getEndDate().getTime() - bookingDTO.getStartDate().getTime());
        int numberOfDays = (int) TimeUnit.DAYS.convert(diffInMillies, TimeUnit.MILLISECONDS);
        if (numberOfDays < 1) numberOfDays = 1;

        User customer = null;
        User createdBy = null;
        if(bookingDTO.getCreatedById() != null){
            createdBy = userRepository.findById(bookingDTO.getCreatedById())
                    .orElseThrow(() -> new RuntimeException("CreatedBy user not found"));
        }

        Bookings booking = Bookings.builder()
                .createdBy(createdBy)
                .source(bookingDTO.getSource())
                .status(BookingStatus.PENDING)
                .startDate(bookingDTO.getStartDate())
                .endDate(bookingDTO.getEndDate())
                .roomType(bookingDTO.getRoomType())
                .roomNumber(bookingDTO.getRoomNumber())
                .adultNumber(bookingDTO.getAdultNumber())
                .childNumber(bookingDTO.getChildNumber())
                .build();

        if (createdBy instanceof Customer) {
            if (bookingDTO.getCustomerId() == null) {
                throw new RuntimeException("Customer ID is required when created by customer");
            }
            customer = userRepository.findById(bookingDTO.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            if (!(customer instanceof Customer) || !customer.getId().equals(createdBy.getId())) {
                throw new RuntimeException("Invalid customer ID or customer can only create booking for themselves");
            }
            booking.setCustomer(customer);
        } else if (bookingDTO.getCustomerId() != null) {
            customer = userRepository.findById(bookingDTO.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            booking.setCustomer(customer);
        } else {
            if (bookingDTO.getGuestName() == null || bookingDTO.getGuestEmail() == null || bookingDTO.getGuestPhone() == null) {
                throw new RuntimeException("Guest name, email, and phone are required for non-logged-in users");
            }
            booking.setGuestName(bookingDTO.getGuestName());
            booking.setGuestEmail(bookingDTO.getGuestEmail());
            booking.setGuestPhone(bookingDTO.getGuestPhone());
        }

        Bookings savedBooking = bookingRepository.save(booking);

        if (booking.getCustomer() != null) {
            sendBookingConfirmationEmail(customer, savedBooking, numberOfDays);
        } else {
            String token = UUID.randomUUID().toString();
            AccessToken accessToken = AccessToken.builder()
                    .token(token)
                    .requestId(savedBooking.getId())
                    .requestType("BOOKING")
                    .guestEmail(bookingDTO.getGuestEmail())
                    .expiresAt(LocalDateTime.now().plusHours(24))
                    .build();
            accessTokenRepository.save(accessToken);
            sendGuestBookingEmail(bookingDTO.getGuestEmail(), savedBooking, numberOfDays, token, bookingDTO.getGuestName());
        }

        BookingDTO result = mapToDTO(savedBooking);
        result.setCustomerFullName(customer != null ? customer.getFullName() : null);
        result.setCreatedByFullName(createdBy != null ? createdBy.getFullName() : null);
        result.setNumberOfDays(numberOfDays);
        return result;
    }

    private void sendBookingConfirmationEmail(User customer, Bookings booking, int numberOfDays) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(customer.getEmail());
        mail.setSubject("Booking Confirmation");
        mail.setText("Dear " + customer.getFullName() + ",\n\n" +
                "Your booking has been successfully created with the following details:\n" +
                "Booking ID: " + booking.getId() + "\n" +
                "Start Date: " + booking.getStartDate() + "\n" +
                "End Date: " + booking.getEndDate() + "\n" +
                "Number of Days: " + numberOfDays + "\n" +
                "Room Type: " + booking.getRoomType() + "\n" +
                "Room Number: " + booking.getRoomNumber() + "\n" +
                "Adults: " + booking.getAdultNumber() + "\n" +
                "Children: " + booking.getChildNumber() + "\n\n" +
                "Thank you for your booking!");

        mailSender.send(mail);
    }

    private void sendGuestBookingEmail(String guestEmail, Bookings booking, int numberOfDays, String token, String guestName) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(guestEmail);
        mail.setSubject("Booking Confirmation");
        mail.setText("Dear " + guestName + ",\n\n" +
                "Your booking has been successfully created with the following details:\n" +
                "Booking ID: " + booking.getId() + "\n" +
                "Start Date: " + booking.getStartDate() + "\n" +
                "End Date: " + booking.getEndDate() + "\n" +
                "Number of Days: " + numberOfDays + "\n" +
                "Room Type: " + booking.getRoomType() + "\n" +
                "Room Number: " + booking.getRoomNumber() + "\n" +
                "Adults: " + booking.getAdultNumber() + "\n" +
                "Children: " + booking.getChildNumber() + "\n\n" +
                "View your booking details here: http://localhost:5173/booking/" + booking.getId() + "?token=" + token + "\n\n" +
                "Thank you for your booking!");
        mailSender.send(mail);
    }

    @Override
    public void requestOTP(Long bookingId, String token) {
        AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, bookingId, "BOOKING")
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        String otp = generateRandomOTP(6);
        OTP otpEntity = OTP.builder()
                .otp(otp)
                .guestEmail(accessToken.getGuestEmail())
                .requestId(bookingId)
                .requestType("BOOKING")
                .expiresAt(LocalDateTime.now().plusHours(1))
                .isUsed(false)
                .build();
        otpRepository.save(otpEntity);

        sendOTPToEmail(accessToken.getGuestEmail(), otp);
    }

    private String generateRandomOTP(int length) {
        return String.valueOf((int) ((Math.random() * 9 + 1) * Math.pow(10, length - 1)));
    }

    private void sendOTPToEmail(String email, String otp) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(email);
        mail.setSubject("Your OTP Code");
        mail.setText("Your OTP code is: " + otp + "\nIt is valid for 60 minutes.");
        mailSender.send(mail);
    }

    @Override
    public void verifyOTP(Long bookingId, String token, String otp) {
        AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, bookingId, "BOOKING")
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        OTP otpEntity = otpRepository.findByOtpAndRequestIdAndRequestType(otp, bookingId, "BOOKING")
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));
        if (otpEntity.getExpiresAt().isBefore(LocalDateTime.now()) || otpEntity.isUsed()) {
            throw new RuntimeException("OTP has expired or already used");
        }

        otpEntity.setUsed(true);
        otpRepository.save(otpEntity);
    }

    @Override
    public boolean checkOTPStatus(Long bookingId, String token) {
        AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, bookingId, "BOOKING")
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        return otpRepository.findByRequestIdAndRequestTypeAndIsUsed(bookingId, "BOOKING", true)
                .stream()
                .anyMatch(otp -> otp.getGuestEmail().equals(accessToken.getGuestEmail()) &&
                        !otp.getExpiresAt().isBefore(LocalDateTime.now()));
    }

    @Override
    public PageResponse<BookingDTO> getCustomerBookings(Long customerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Bookings> bookingsPage = bookingRepository.findByCustomerId(customerId, pageable);
        return createPageResponse(bookingsPage);
    }

    @Override
    public PageResponse<BookingDTO> getAllBookings(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Bookings> bookingsPage = bookingRepository.findAll(pageable);
        return createPageResponse(bookingsPage);
    }

    @Override
    public PageResponse<BookingDTO> searchBookings(BookingSearchCriteria criteria, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Bookings> bookingsPage = bookingRepository.findBySearchCriteria(
                criteria.getUserFullName(),
                criteria.getStartDate(),
                criteria.getEndDate(),
                criteria.getStatus(),
                pageable
        );
        return createPageResponse(bookingsPage);
    }

    @Override
    public BookingDetailsDTO getBookingDetails(Long bookingId) {
        Bookings booking = bookingRepository.findById(Math.toIntExact(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        List<RoomBookings> roomBookings = roomBookingRepository.findByBookingsId(bookingId);
        List<RoomBookingDTO> roomBookingDTOs = roomBookings.stream()
                .map(this::mapToRoomBookingDTO)
                .collect(Collectors.toList());

        List<ServiceUsage> serviceUsages = serviceUsageRepository.findByBookingsId(bookingId);
        List<ServiceUsageDTO> serviceUsageDTOs = serviceUsages.stream()
                .map(this::mapToServiceUsageDTO)
                .collect(Collectors.toList());

        BookingDetailsDTO detailsDTO = new BookingDetailsDTO();
        detailsDTO.setBooking(mapToDTO(booking));
        detailsDTO.setRooms(roomBookingDTOs);
        detailsDTO.setServiceUsages(serviceUsageDTOs);

        return detailsDTO;
    }

    @Override
    @Transactional
    public BookingDTO updateBooking(Long bookingId, BookingDTO bookingDTO, String token) {
        Bookings booking = bookingRepository.findById(Math.toIntExact(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Can only update bookings in PENDING status");
        }

        if (booking.getCustomer() == null && token != null) {
            AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, bookingId, "BOOKING")
                    .orElseThrow(() -> new RuntimeException("Invalid token"));
            if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Token has expired");
            }

            boolean hasValidOTP = otpRepository.findByRequestIdAndRequestTypeAndIsUsed(bookingId, "BOOKING", true)
                    .stream().anyMatch(otp -> otp.getGuestEmail().equals(booking.getGuestEmail()) &&
                            !otp.getExpiresAt().isBefore(LocalDateTime.now()));
            if (!hasValidOTP) {
                throw new RuntimeException("No valid OTP found");
            }
        }

        booking.setStartDate(bookingDTO.getStartDate());
        booking.setEndDate(bookingDTO.getEndDate());
        booking.setRoomType(bookingDTO.getRoomType());
        booking.setRoomNumber(bookingDTO.getRoomNumber());
        booking.setAdultNumber(bookingDTO.getAdultNumber());
        booking.setChildNumber(bookingDTO.getChildNumber());
        if (booking.getCustomer() == null) {
            booking.setGuestName(bookingDTO.getGuestName());
        }

        Bookings updatedBooking = bookingRepository.save(booking);

        long diffInMillies = Math.abs(bookingDTO.getEndDate().getTime() - bookingDTO.getStartDate().getTime());
        int numberOfDays = (int) TimeUnit.DAYS.convert(diffInMillies, TimeUnit.MILLISECONDS);
        if (numberOfDays < 1) numberOfDays = 1;

        BookingDTO result = mapToDTO(updatedBooking);
        result.setCustomerFullName(updatedBooking.getCustomer() != null ? updatedBooking.getCustomer().getFullName() : null);
        result.setCreatedByFullName(updatedBooking.getCreatedBy() != null ? updatedBooking.getCreatedBy().getFullName() : null);
        result.setNumberOfDays(numberOfDays);
        return result;
    }

    @Override
    @Transactional
    public void deleteBooking(Long bookingId) {
        List<RoomBookings> roomBookings = roomBookingRepository.findByBookingsId(bookingId);
        roomBookingRepository.deleteAll(roomBookings);

        bookingRepository.deleteById(Math.toIntExact(bookingId));
    }

    @Override
    public BookingDTO changeBookingStatus(Long bookingId, BookingStatus status, String token) {
        Bookings booking = bookingRepository.findById(Math.toIntExact(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getCustomer() == null && token != null) {
            AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, bookingId, "BOOKING")
                    .orElseThrow(() -> new RuntimeException("Invalid token"));
            if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Token has expired");
            }

            boolean hasValidOTP = otpRepository.findByRequestIdAndRequestTypeAndIsUsed(bookingId, "BOOKING", true)
                    .stream().anyMatch(otp -> otp.getGuestEmail().equals(booking.getGuestEmail()) &&
                            !otp.getExpiresAt().isBefore(LocalDateTime.now()));
            if (!hasValidOTP) {
                throw new RuntimeException("No valid OTP found");
            }
        }

        booking.setStatus(status);
        Bookings updatedBooking = bookingRepository.save(booking);

        return mapToDTO(updatedBooking);
    }

    @Override
    @Transactional
    public void checkIn(Long bookingId) {
        Bookings booking = bookingRepository.findById(Math.toIntExact(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking is not in CONFIRMED status");
        }
        booking.setStatus(BookingStatus.CHECKIN);

        booking.setCheckInTime(LocalDateTime.now());
        bookingRepository.save(booking);

        List<RoomBookings> roomBookings = roomBookingRepository.findByBookingsId(bookingId);

        for (RoomBookings roomBooking : roomBookings) {
            Room room = roomBooking.getRoom();
            room.setRoomStatus(RoomStatus.OCCUPIED);
            roomRepository.save(room);
        }
    }

    @Override
    public List<MonthlyBookingStatsDTO> getMonthlyBookingStats(int year) {
        Map<Integer, Long> monthStatsMap = new LinkedHashMap<>();
        for (int i = 1; i <= 12; i++) {
            monthStatsMap.put(i, 0L);
        }

        List<Object[]> results = bookingRepository.countBookingsByMonth(year);
        for (Object[] result : results) {
            int monthNumber = (Integer) result[0];
            long count = (Long) result[1];
            monthStatsMap.put(monthNumber, count);
        }

        List<MonthlyBookingStatsDTO> stats = new ArrayList<>();
        for (Map.Entry<Integer, Long> entry : monthStatsMap.entrySet()) {
            String monthName = Month.of(entry.getKey()).getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            stats.add(new MonthlyBookingStatsDTO(monthName, entry.getValue()));
        }

        return stats;
    }

    @Override
    public List<BookingDTO> getRecentBookings(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "id"));
        Page<Bookings> bookingsPage = bookingRepository.findAll(pageable);
        return bookingsPage.stream().map(this::mapToDTO).collect(Collectors.toList());
    }


    private BookingDTO mapToDTO(Bookings booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setCustomerId(booking.getCustomer() != null ? booking.getCustomer().getId() : null);
        dto.setCreatedById(booking.getCreatedBy() != null ? booking.getCreatedBy().getId() : null);
        dto.setCustomerFullName(booking.getCustomer() != null ? booking.getCustomer().getFullName() : null);
        dto.setCreatedByFullName(booking.getCreatedBy() != null ? booking.getCreatedBy().getFullName() : null);
        dto.setGuestEmail(booking.getGuestEmail());
        dto.setGuestName(booking.getGuestName());
        dto.setGuestPhone(booking.getGuestPhone());
        dto.setSource(booking.getSource());
        dto.setStatus(booking.getStatus());
        dto.setTotalPrice(booking.getTotalPrice());
        dto.setStartDate(booking.getStartDate());
        dto.setEndDate(booking.getEndDate());
        dto.setRoomType(booking.getRoomType());
        dto.setRoomNumber(booking.getRoomNumber());
        dto.setAdultNumber(booking.getAdultNumber());
        dto.setChildNumber(booking.getChildNumber());
        dto.setCheckInTime(booking.getCheckInTime());
        dto.setCheckOutTime(booking.getCheckOutTime());

        long diffInMillies = Math.abs(booking.getEndDate().getTime() - booking.getStartDate().getTime());
        int numberOfDays = (int) TimeUnit.DAYS.convert(diffInMillies, TimeUnit.MILLISECONDS);
        if (numberOfDays < 1) numberOfDays = 1;
        dto.setNumberOfDays(numberOfDays);

        return dto;
    }

    private ServiceUsageDTO mapToServiceUsageDTO(ServiceUsage serviceUsage) {
        ServiceUsageDTO dto = new ServiceUsageDTO();
        dto.setId(serviceUsage.getId());
        dto.setBookingId(serviceUsage.getBookings().getId());
        dto.setServiceId(serviceUsage.getServices().getId());
        dto.setServiceName(serviceUsage.getServices().getServiceName());
        dto.setQuantity(serviceUsage.getQuantity());
        dto.setTotalPrice(serviceUsage.getTotalPrice());
        return dto;
    }

    private RoomBookingDTO mapToRoomBookingDTO(RoomBookings rb) {
        RoomBookingDTO dto = new RoomBookingDTO();
        dto.setId(rb.getId());
        dto.setRoomId(rb.getRoom().getId());
        dto.setRoomNumber(rb.getRoom().getRoomName());
        dto.setRoomType(rb.getRoom().getRoomType());
        dto.setPricePerNight(Integer.parseInt(rb.getRoom().getPrice()));
        dto.setBookingId(rb.getBookings().getId());
        return dto;
    }

    private PageResponse<BookingDTO> createPageResponse(Page<Bookings> bookingsPage) {
        List<BookingDTO> bookingDTOs = bookingsPage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        PageResponse<BookingDTO> response = new PageResponse<>();
        response.setContent(bookingDTOs);
        response.setPageNumber(bookingsPage.getNumber());
        response.setPageSize(bookingsPage.getSize());
        response.setTotalElements(bookingsPage.getTotalElements());
        response.setTotalPages(bookingsPage.getTotalPages());

        return response;
    }
}
