package com.example.HMS.service;

import com.example.HMS.dto.FolioChargesDTO;
import com.example.HMS.dto.FolioDTO;
import com.example.HMS.dto.FolioResponseDTO;
import com.example.HMS.exception.ResourceNotFoundException;
import com.example.HMS.model.*;
import com.example.HMS.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolioServiceImpl implements FolioService{
    private final FolioRepository folioRepository;
    private final ModelMapper modelMapper;
    private final LoyaltyLevelRepository loyaltyLevelRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final BookingsRepository bookingsRepository;
    private final AccessTokenRepository accessTokenRepository;
    private final OTPRepository otpRepository;
    private final JavaMailSender mailSender;

    @Override
    public Page<FolioDTO> getAllFolios(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<Folio> spec = (root, query, cb) -> {
            if (StringUtils.isEmpty(search)) {
                return cb.conjunction();
            }
            return cb.like(cb.lower(root.get("user").get("fullName")), "%" + search.toLowerCase() + "%");
        };

        return folioRepository.findAll(spec, pageable)
                .map(folio -> {
                    FolioDTO dto = modelMapper.map(folio, FolioDTO.class);
                    dto.setCustomerName(folio.getUser().getFullName());
                    dto.setBookingId(folio.getBookings().getId());
                    return dto;
                });
    }

    @Override
    public FolioDTO getFolioByBookingId(Long bookingId) {
        Folio folio = folioRepository.findByBookingsId(bookingId)
                .orElseThrow(() -> new RuntimeException("Folio not found for booking ID: " + bookingId));
        return modelMapper.map(folio, FolioDTO.class);
    }

    @Override
    public FolioResponseDTO getFolioDetails(Long folioId, Long userId, Role userRole, String token) {
        Folio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new RuntimeException("Folio not found"));

        if (userRole != null) {
            if (userRole == Role.ADMIN || userRole == Role.RECEPTIONIST) {
                // Admin và lễ tân có thể xem tất cả, bỏ qua kiểm tra
            } else {
                // Khách hàng chỉ được xem folio của mình
                if (folio.getUser() == null || !folio.getUser().getId().equals(userId)) {
                    throw new RuntimeException("You are not authorized to view this folio");
                }
            }
        } else {
            // Trường hợp khách chưa đăng nhập -> yêu cầu token
            if (token == null) {
                throw new RuntimeException("Token is required for guest users");
            }
            AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, folioId, "FOLIO")
                    .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
            if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Token has expired");
            }
            if (!accessToken.getGuestEmail().equals(folio.getGuestEmail())) {
                throw new RuntimeException("Unauthorized access");
            }
        }

        FolioDTO folioDTO = convertToFolioDTO(folio);
        List<FolioChargesDTO> details = folio.getFolioDetails().stream()
                .map(detail -> modelMapper.map(detail, FolioChargesDTO.class))
                .collect(Collectors.toList());

        FolioResponseDTO response = new FolioResponseDTO();
        response.setFolio(folioDTO);
        response.setFolioCharges(details);
        return response;
    }

    @Override
    @Transactional
    public FolioDTO updateFolioStatus(Long folioId, FolioStatus status) {
        Folio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new ResourceNotFoundException("Folio not found"));

        folio.setStatus(status);
        if (status == FolioStatus.PAID) {
            User user = folio.getUser();
            if (user instanceof Customer) {
                Customer customer = (Customer) user;
                updateCustomerLoyaltyPoints(customer, folio.getTotalAmount());
            }
        }
        folio.setUpdatedAt(LocalDateTime.now());
        folio = folioRepository.save(folio);

        FolioDTO dto = modelMapper.map(folio, FolioDTO.class);
        dto.setCustomerName(folio.getUser().getFullName());
        return dto;
    }

    private void updateCustomerLoyaltyPoints(Customer customer, double amount) {
        double pointsToAdd = amount / 100.0;
        double currentPoints = customer.getLoyaltyPoints();
        double newTotalPoints = currentPoints + pointsToAdd;

        customer.setLoyaltyPoints(newTotalPoints);

        LoyaltyLevel currentLevel = customer.getLoyaltyLevel();
        LoyaltyLevel nextLevel = findNextLoyaltyLevel(currentLevel, newTotalPoints);

        if (nextLevel != null && !nextLevel.equals(currentLevel)) {
            customer.setLoyaltyLevel(nextLevel);
        }

        customerRepository.save(customer);
    }

    private LoyaltyLevel findNextLoyaltyLevel(LoyaltyLevel currentLevel, double totalPoints) {
        return loyaltyLevelRepository.findHighestLevelForPoints(totalPoints)
                .orElse(currentLevel);
    }

    @Override
    public Page<FolioDTO> getUserFolios(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return folioRepository.findByUserId(userId, pageable)
                .map(folio -> {
                    FolioDTO dto = modelMapper.map(folio, FolioDTO.class);
                    dto.setCustomerName(folio.getUser().getFullName());
                    dto.setBookingId(folio.getBookings().getId());
                    return dto;
                });
    }

    @Override
    @Transactional
    public FolioDTO createFolio(Long bookingId) {
        Bookings booking = bookingsRepository.findById(Math.toIntExact(bookingId))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (folioRepository.findByBookingsId(bookingId).isPresent()) {
            throw new RuntimeException("Folio already exists for booking ID: " + bookingId);
        }

        User user = null;
        Customer customer = null;
        double discountPercentage = 0.0;
        String customerName = null;
        String guestName = booking.getGuestName();
        String email = booking.getGuestEmail();

        if (booking.getCustomer() != null) {
            user = userRepository.findById(booking.getCustomer().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (user instanceof org.hibernate.proxy.HibernateProxy proxy) {
                user = (User) proxy.getHibernateLazyInitializer().getImplementation();
            }

            if (user instanceof Customer) {
                customer = (Customer) user;
                customerName = user.getFullName();

                if (customer.getLoyaltyLevel() != null) {
                    discountPercentage = switch (customer.getLoyaltyLevel().getLevelName()) {
                        case "BRONZE" -> 0.05;
                        case "SILVER" -> 0.10;
                        case "GOLD" -> 0.15;
                        case "PLATINUM" -> 0.20;
                        default -> 0.0;
                    };
                } else {
                    discountPercentage = 0.0;
                }
            } else {
                throw new IllegalArgumentException("User is not a Customer");
            }
        }

        Folio folio = new Folio();
        folio.setUser(user);
        folio.setBookings(booking);
        folio.setGuestName(guestName);
        folio.setGuestEmail(email);
        folio.setStatus(FolioStatus.PENDING);
        folio.setCreatedAt(LocalDateTime.now());
        folio.setUpdatedAt(LocalDateTime.now());

        List<FolioCharges> folioCharges = new ArrayList<>();
        double totalAmount = 0.0;

        for (RoomBookings roomBooking : booking.getRoomBookings()) {
            Room room = roomBooking.getRoom();
            long days = TimeUnit.DAYS.convert(
                    booking.getEndDate().getTime() - booking.getStartDate().getTime(),
                    TimeUnit.MILLISECONDS
            );
            if (days < 1) days = 1;

            FolioCharges charge = new FolioCharges();
            charge.setFolio(folio);
            charge.setChargeType("ROOM");
            charge.setDescription("Room charge for " + room.getRoomName());
            charge.setItemName(room.getRoomName());
            charge.setQuantity((int) days);
            charge.setUnitPrice(Double.parseDouble(room.getPrice()));
            charge.setTotalPrice(days * Double.parseDouble(room.getPrice()));
            charge.setChargeTime(LocalDateTime.now());

            folioCharges.add(charge);
            totalAmount += charge.getTotalPrice();
        }

        for (ServiceUsage serviceUsage : booking.getServiceUsages()) {
            Services service = serviceUsage.getServices();

            FolioCharges charge = new FolioCharges();
            charge.setFolio(folio);
            charge.setChargeType("SERVICE");
            charge.setDescription("Service: " + service.getServiceName());
            charge.setItemName(service.getServiceName());
            charge.setQuantity(serviceUsage.getQuantity());
            charge.setUnitPrice(service.getServicePrice());
            charge.setTotalPrice(serviceUsage.getQuantity() * service.getServicePrice());
            charge.setChargeTime(serviceUsage.getTimestamp());

            folioCharges.add(charge);
            totalAmount += charge.getTotalPrice();
        }

        totalAmount = totalAmount * (1.0 - discountPercentage);
        folio.setTotalAmount(totalAmount);
        folio.setFolioDetails(folioCharges);

        Folio savedFolio = folioRepository.save(folio);

        if (user != null) {
            sendConfirmationEmail(user.getEmail(), savedFolio, user.getFullName());
        } else {
            String token = UUID.randomUUID().toString();
            AccessToken accessToken = AccessToken.builder()
                    .token(token)
                    .requestId(savedFolio.getId())
                    .requestType("FOLIO")
                    .guestEmail(email)
                    .expiresAt(LocalDateTime.now().plusHours(24))
                    .build();
            accessTokenRepository.save(accessToken);
            sendGuestConfirmationEmail(email, savedFolio, token, guestName);
        }

        FolioDTO dto = modelMapper.map(folio, FolioDTO.class);
        dto.setCustomerName(customerName);
        return dto;
    }

    private void sendConfirmationEmail(String email, Folio folio, String name) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(email);
        mail.setSubject("Folio Created");
        mail.setText("Dear " + name + ",\n\n" +
                "Your folio has been created with the following details:\n" +
                "Folio ID: " + folio.getId() + "\n" +
                "Booking ID: " + folio.getBookings().getId() + "\n" +
                "Total Amount: " + folio.getTotalAmount() + "\n" +
                "Status: " + folio.getStatus() + "\n\n" +
                "Thank you!");
        mailSender.send(mail);
    }

    private void sendGuestConfirmationEmail(String email, Folio folio, String token, String guestName) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(email);
        mail.setSubject("Folio Created");
        mail.setText("Dear " + guestName + ",\n\n" +
                "Your folio has been created with the following details:\n" +
                "Folio ID: " + folio.getId() + "\n" +
                "Booking ID: " + folio.getBookings().getId() + "\n" +
                "Total Amount: " + folio.getTotalAmount() + "\n" +
                "Status: " + folio.getStatus() + "\n\n" +
                "View your folio details here: http://localhost:5173/transactions/" + folio.getId() + "?token=" + token + "\n\n" +
                "Thank you!");
        mailSender.send(mail);
    }

    private FolioDTO convertToFolioDTO(Folio folio){
        FolioDTO folioDTO = new FolioDTO();
        folioDTO.setId(folio.getId());
        folioDTO.setBookingId(folio.getBookings().getId());
        folioDTO.setUserId(folio.getUser() != null ? folio.getUser().getId() : null);
        folioDTO.setGuestName(folio.getGuestName());
        folioDTO.setGuestEmail(folio.getGuestEmail());
        folioDTO.setCustomerName(folio.getUser() != null ? folio.getUser().getFullName() : null);
        folioDTO.setTotalAmount(folio.getTotalAmount());
        folioDTO.setStatus(folio.getStatus());
        folioDTO.setCreatedAt(folio.getCreatedAt());
        folioDTO.setUpdatedAt(folio.getUpdatedAt());

        return folioDTO;
    }

}
