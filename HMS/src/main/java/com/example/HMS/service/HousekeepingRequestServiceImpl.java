package com.example.HMS.service;

import com.example.HMS.dto.HousekeepingRequestDTO;
import com.example.HMS.exception.AccessDeniedException;
import com.example.HMS.exception.ResourceNotFoundException;
import com.example.HMS.model.*;
import com.example.HMS.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HousekeepingRequestServiceImpl implements HousekeepingRequestService{
    private final HousekeepingRequestRepository requestRepository;
    private final RoomRepository roomRepository;
    private final CustomerRepository customerRepository;
    private final JavaMailSender mailSender;
    private final AccessTokenRepository accessTokenRepository;
    private final OTPRepository otpRepository;

    @Override
    public HousekeepingRequestDTO createRequest(HousekeepingRequestDTO requestDTO, Long customerId) {
        Room room = roomRepository.findByRoomName(requestDTO.getRoomName())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        Customer customer = null;
        String guestEmail = null;
        String guestName = null;

        if (customerId != null) {
            customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
        } else {
            if (requestDTO.getGuestName() == null || requestDTO.getGuestEmail() == null) {
                throw new RuntimeException("Guest name and email are required for non-logged-in users");
            }
            guestName = requestDTO.getGuestName();
            guestEmail = requestDTO.getGuestEmail();
        }

        HousekeepingRequest request = new HousekeepingRequest();
        request.setRoom(room);
        request.setCustomer(customer);
        request.setGuestName(guestName);
        request.setGuestEmail(guestEmail);
        request.setNotes(requestDTO.getNotes());
        request.setPreferredTime(requestDTO.getPreferredTime());
        request.setCreatedAt(LocalDateTime.now());
        request.setStatus(HousekeepingStatus.PENDING);

        HousekeepingRequest savedRequest = requestRepository.save(request);

        if (customer != null) {
            sendConfirmationEmail(customer.getEmail(), savedRequest, customer.getFullName());
        } else {
            String newToken = UUID.randomUUID().toString();
            AccessToken accessToken = AccessToken.builder()
                    .token(newToken)
                    .requestId(savedRequest.getId())
                    .requestType("HOUSEKEEPING_REQUEST")
                    .guestEmail(guestEmail)
                    .expiresAt(LocalDateTime.now().plusHours(24))
                    .build();
            accessTokenRepository.save(accessToken);
            sendGuestConfirmationEmail(guestEmail, savedRequest, newToken, guestName);
        }

        return convertToDTO(savedRequest);
    }

    private void sendConfirmationEmail(String email, HousekeepingRequest request, String fullName) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(email);
        mail.setSubject("Housekeeping Request Confirmation");
        mail.setText("Dear " + fullName + ",\n\n" +
                "Your housekeeping request has been created with the following details:\n" +
                "Request ID: " + request.getId() + "\n" +
                "Room: " + request.getRoom().getRoomName() + "\n" +
                "Preferred Time: " + request.getPreferredTime() + "\n" +
                "Notes: " + request.getNotes() + "\n\n" +
                "Thank you for your request!");
        mailSender.send(mail);
    }

    private void sendGuestConfirmationEmail(String email, HousekeepingRequest request, String token, String guestName) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(email);
        mail.setSubject("Housekeeping Request Confirmation");
        mail.setText("Dear " + guestName + ",\n\n" +
                "Your housekeeping request has been created with the following details:\n" +
                "Request ID: " + request.getId() + "\n" +
                "Room: " + request.getRoom().getRoomName() + "\n" +
                "Preferred Time: " + request.getPreferredTime() + "\n" +
                "Notes: " + request.getNotes() + "\n\n" +
                "View your request details here: http://localhost:5173/housekeeping-requests/" + request.getId() + "?token=" + token + "\n\n" +
                "Thank you for your request!");
        mailSender.send(mail);
    }

    @Override
    public Page<HousekeepingRequestDTO> getCustomerRequests(Long customerId, HousekeepingStatus status, Pageable pageable) {
        Page<HousekeepingRequest> requests = status != null
                ? requestRepository.findByCustomerIdAndStatus(customerId, status, pageable)
                : requestRepository.findByCustomerId(customerId, pageable);
        return requests.map(this::convertToDTO);
    }

    @Override
    public HousekeepingRequestDTO getRequestById(Long id, Long customerId, String token) {
        HousekeepingRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (customerId != null) {
            if (request.getCustomer() == null || !request.getCustomer().getId().equals(customerId)) {
                throw new RuntimeException("You are not authorized to view this request");
            }
        } else {
            if (token == null) {
                throw new RuntimeException("Token is required for guest users");
            }
            AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, id, "HOUSEKEEPING_REQUEST")
                    .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
            if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Token has expired");
            }
            if (!accessToken.getGuestEmail().equals(request.getGuestEmail())) {
                throw new RuntimeException("Unauthorized access");
            }
        }

        return convertToDTO(request);
    }

    @Override
    public void cancelRequest(Long id, Long customerId, String token) {
        HousekeepingRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (customerId != null) {
            if (request.getCustomer() == null || !request.getCustomer().getId().equals(customerId)) {
                throw new RuntimeException("You are not authorized to cancel this request");
            }
        } else {
            if (token == null) {
                throw new RuntimeException("Token is required for guest users");
            }
            AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, id, "HOUSEKEEPING_REQUEST")
                    .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
            if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Token has expired");
            }
            boolean hasValidOTP = otpRepository.findByRequestIdAndRequestTypeAndIsUsed(id, "HOUSEKEEPING_REQUEST", true)
                    .stream().anyMatch(otp -> otp.getGuestEmail().equals(request.getGuestEmail()) &&
                            !otp.getExpiresAt().isBefore(LocalDateTime.now()));
            if (!hasValidOTP) {
                throw new RuntimeException("No valid OTP found");
            }
        }

        if (request.getStatus() != HousekeepingStatus.PENDING) {
            throw new RuntimeException("Only PENDING requests can be cancelled");
        }

        request.setStatus(HousekeepingStatus.CANCELLED);
        requestRepository.save(request);
    }

    @Override
    public HousekeepingRequestDTO updateRequest(Long id, HousekeepingRequestDTO requestDTO, Long customerId, String token) {
        HousekeepingRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (customerId != null) {
            if (request.getCustomer() == null || !request.getCustomer().getId().equals(customerId)) {
                throw new RuntimeException("You are not authorized to update this request");
            }
        } else {
            if (token == null) {
                throw new RuntimeException("Token is required for guest users");
            }
            AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, id, "HOUSEKEEPING_REQUEST")
                    .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
            if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Token has expired");
            }
            boolean hasValidOTP = otpRepository.findByRequestIdAndRequestTypeAndIsUsed(id, "HOUSEKEEPING_REQUEST", true)
                    .stream().anyMatch(otp -> otp.getGuestEmail().equals(request.getGuestEmail()) &&
                            !otp.getExpiresAt().isBefore(LocalDateTime.now()));
            if (!hasValidOTP) {
                throw new RuntimeException("No valid OTP found");
            }
        }

        Room room = roomRepository.findByRoomName(requestDTO.getRoomName())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        request.setRoom(room);
        request.setNotes(requestDTO.getNotes());
        request.setPreferredTime(requestDTO.getPreferredTime());
        if (customerId == null) {
            request.setGuestName(requestDTO.getGuestName());
        }

        HousekeepingRequest updatedRequest = requestRepository.save(request);
        return convertToDTO(updatedRequest);
    }

    @Override
    public void requestOTP(Long requestId, String token) {
        AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, requestId, "HOUSEKEEPING_REQUEST")
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        String otp = generateRandomOTP(6);
        OTP otpEntity = OTP.builder()
                .otp(otp)
                .guestEmail(accessToken.getGuestEmail())
                .requestId(requestId)
                .requestType("HOUSEKEEPING_REQUEST")
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
    public void verifyOTP(Long requestId, String token, String otp) {
        AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, requestId, "HOUSEKEEPING_REQUEST")
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        OTP otpEntity = otpRepository.findByOtpAndRequestIdAndRequestType(otp, requestId, "HOUSEKEEPING_REQUEST")
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));
        if (otpEntity.getExpiresAt().isBefore(LocalDateTime.now()) || otpEntity.isUsed()) {
            throw new RuntimeException("OTP has expired or already used");
        }

        otpEntity.setUsed(true);
        otpRepository.save(otpEntity);
    }

    @Override
    public boolean checkOTPStatus(Long requestId, String token) {
        AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, requestId, "HOUSEKEEPING_REQUEST")
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        return otpRepository.findByRequestIdAndRequestTypeAndIsUsed(requestId, "HOUSEKEEPING_REQUEST", true)
                .stream()
                .anyMatch(otp -> otp.getGuestEmail().equals(accessToken.getGuestEmail()) &&
                        !otp.getExpiresAt().isBefore(LocalDateTime.now()));
    }

    @Override
    public Page<HousekeepingRequestDTO> getAllRequests(String customerName, String roomName, Pageable pageable) {
        Page<HousekeepingRequest> requests = requestRepository.findWithFilters(customerName, roomName, pageable);
        return requests.map(this::convertToDTO);
    }

    @Override
    public HousekeepingRequestDTO getRequestByIdAdmin(Long id) {
        HousekeepingRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        return convertToDTO(request);
    }

    @Override
    public HousekeepingRequestDTO updateRequestStatus(Long id, HousekeepingStatus status) {
        HousekeepingRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        request.setStatus(status);
        request = requestRepository.save(request);
        return convertToDTO(request);
    }

    private HousekeepingRequestDTO convertToDTO(HousekeepingRequest request) {
        HousekeepingRequestDTO dto = new HousekeepingRequestDTO();
        dto.setId(request.getId());
        dto.setRoomId(request.getRoom().getId());
        dto.setRoomName(request.getRoom().getRoomName());
        dto.setCustomerId(request.getCustomer() != null ? request.getCustomer().getId() : null);
        dto.setCustomerName(request.getCustomer() != null ? request.getCustomer().getFullName() : request.getGuestName());
        dto.setGuestName(request.getGuestName());
        dto.setGuestEmail(request.getGuestEmail());
        dto.setStatus(request.getStatus());
        dto.setNotes(request.getNotes());
        dto.setPreferredTime(request.getPreferredTime());
        dto.setCreatedAt(request.getCreatedAt());
        return dto;
    }
}
