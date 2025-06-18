package com.example.HMS.service;

import com.example.HMS.dto.ServiceRequestDTO;
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
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServiceRequestServiceImpl implements ServiceRequestService {
    private final ServiceRequestRepository requestRepository;
    private final ServiceRepository serviceRepository;
    private final BookingsRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final ServiceUsageRepository serviceUsageRepository;
    private final AccessTokenRepository accessTokenRepository;
    private final OTPRepository otpRepository;
    private final JavaMailSender mailSender;

    @Override
    public ServiceRequestDTO createRequest(ServiceRequestDTO requestDTO, Long customerId) {
        Bookings booking = bookingRepository.findById(Math.toIntExact(requestDTO.getBookingId()))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        Customer customer = null;
        String guestName = null;
        String guestEmail = null;

        if (customerId != null) {
            if (booking.getCustomer() == null || !booking.getCustomer().getId().equals(customerId)) {
                throw new RuntimeException("You are not authorized to request service for this booking");
            }
            customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
        } else {
            if (requestDTO.getGuestName() == null || requestDTO.getGuestEmail() == null) {
                throw new RuntimeException("Guest name and email are required for non-logged-in users");
            }
            guestName = requestDTO.getGuestName();
            guestEmail = requestDTO.getGuestEmail();
            if (!guestEmail.equals(booking.getGuestEmail())) {
                throw new RuntimeException("Guest email does not match booking email");
            }
        }

        Services service = serviceRepository.findById(requestDTO.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        ServiceRequest request = new ServiceRequest();
        request.setCustomer(customer);
        request.setBooking(booking);
        request.setService(service);
        request.setQuantity(requestDTO.getQuantity());
        request.setTotalAmount(service.getServicePrice() * requestDTO.getQuantity());
        request.setNotes(requestDTO.getNotes());
        request.setGuestName(guestName);
        request.setGuestEmail(guestEmail);
        request.setStatus(ServiceRequestStatus.PENDING);

        ServiceRequest savedRequest = requestRepository.save(request);
        if (customer != null) {
            sendConfirmationEmail(customer.getEmail(), savedRequest, customer.getFullName());
        } else {
            String newToken = UUID.randomUUID().toString();
            AccessToken accessToken = AccessToken.builder()
                    .token(newToken)
                    .requestId(savedRequest.getId())
                    .requestType("SERVICE_REQUEST")
                    .guestEmail(guestEmail)
                    .expiresAt(LocalDateTime.now().plusHours(24))
                    .build();
            accessTokenRepository.save(accessToken);
            sendGuestConfirmationEmail(guestEmail, savedRequest, newToken, guestName);
        }

        return convertToDTO(savedRequest);
    }

    private void sendConfirmationEmail(String email, ServiceRequest request, String fullName) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(email);
        mail.setSubject("Service Request Confirmation");
        mail.setText("Dear " + fullName + ",\n\n" +
                "Your service request has been created with the following details:\n" +
                "Request ID: " + request.getId() + "\n" +
                "Service: " + request.getService().getServiceName() + "\n" +
                "Quantity: " + request.getQuantity() + "\n" +
                "Total Amount: " + request.getTotalAmount() + "\n" +
                "Notes: " + request.getNotes() + "\n\n" +
                "Thank you for your request!");
        mailSender.send(mail);
    }

    private void sendGuestConfirmationEmail(String email, ServiceRequest request, String token, String guestName) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(email);
        mail.setSubject("Service Request Confirmation");
        mail.setText("Dear " + guestName + ",\n\n" +
                "Your service request has been created with the following details:\n" +
                "Request ID: " + request.getId() + "\n" +
                "Service: " + request.getService().getServiceName() + "\n" +
                "Quantity: " + request.getQuantity() + "\n" +
                "Total Amount: " + request.getTotalAmount() + "\n" +
                "Notes: " + request.getNotes() + "\n\n" +
                "View your request details here: http://localhost:5173/service-requests/" + request.getId() + "?token=" + token + "\n\n" +
                "Thank you for your request!");
        mailSender.send(mail);
    }

    @Override
    public Page<ServiceRequestDTO> getCustomerRequests(Long customerId, ServiceRequestStatus status, Pageable pageable) {
        Page<ServiceRequest> requests = status != null
                ? requestRepository.findByBookingCustomerIdAndStatus(customerId, status, pageable)
                : requestRepository.findByBookingCustomerId(customerId, pageable);
        return requests.map(this::convertToDTO);
    }

    @Override
    public ServiceRequestDTO getRequestById(Long id, Long customerId, String token) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (customerId != null) {
            if (request.getBooking().getCustomer() == null || !request.getBooking().getCustomer().getId().equals(customerId)) {
                throw new RuntimeException("You are not authorized to view this request");
            }
        } else {
            if (token == null) {
                throw new RuntimeException("Token is required for guest users");
            }
            AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, id, "SERVICE_REQUEST")
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
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (customerId != null) {
            if (request.getBooking().getCustomer() == null || !request.getBooking().getCustomer().getId().equals(customerId)) {
                throw new RuntimeException("You are not authorized to cancel this request");
            }
        } else {
            if (token == null) {
                throw new RuntimeException("Token is required for guest users");
            }
            AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, id, "SERVICE_REQUEST")
                    .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
            if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Token has expired");
            }
            boolean hasValidOTP = otpRepository.findByRequestIdAndRequestTypeAndIsUsed(id, "SERVICE_REQUEST", true)
                    .stream().anyMatch(otp -> otp.getGuestEmail().equals(request.getGuestEmail()) &&
                            !otp.getExpiresAt().isBefore(LocalDateTime.now()));
            if (!hasValidOTP) {
                throw new RuntimeException("No valid OTP found");
            }
        }

        if (request.getStatus() != ServiceRequestStatus.PENDING) {
            throw new RuntimeException("Only PENDING requests can be cancelled");
        }

        request.setStatus(ServiceRequestStatus.CANCELLED);
        requestRepository.save(request);
    }

    @Override
    public ServiceRequestDTO updateRequest(Long id, ServiceRequestDTO requestDTO, Long customerId, String token) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (customerId != null) {
            if (request.getBooking().getCustomer() == null || !request.getBooking().getCustomer().getId().equals(customerId)) {
                throw new RuntimeException("You are not authorized to update this request");
            }
        } else {
            if (token == null) {
                throw new RuntimeException("Token is required for guest users");
            }
            AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, id, "SERVICE_REQUEST")
                    .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
            if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Token has expired");
            }
            boolean hasValidOTP = otpRepository.findByRequestIdAndRequestTypeAndIsUsed(id, "SERVICE_REQUEST", true)
                    .stream().anyMatch(otp -> otp.getGuestEmail().equals(request.getGuestEmail()) &&
                            !otp.getExpiresAt().isBefore(LocalDateTime.now()));
            if (!hasValidOTP) {
                throw new RuntimeException("No valid OTP found");
            }
        }

        Services service = serviceRepository.findById(requestDTO.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        request.setService(service);
        request.setQuantity(requestDTO.getQuantity());
        request.setTotalAmount(service.getServicePrice() * requestDTO.getQuantity());
        request.setNotes(requestDTO.getNotes());
        if (customerId == null) {
            request.setGuestName(requestDTO.getGuestName());
        }

        ServiceRequest updatedRequest = requestRepository.save(request);
        return convertToDTO(updatedRequest);
    }

    @Override
    public void requestOTP(Long requestId, String token) {
        AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, requestId, "SERVICE_REQUEST")
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        String otp = generateRandomOTP(6);
        OTP otpEntity = OTP.builder()
                .otp(otp)
                .guestEmail(accessToken.getGuestEmail())
                .requestId(requestId)
                .requestType("SERVICE_REQUEST")
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
        AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, requestId, "SERVICE_REQUEST")
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        OTP otpEntity = otpRepository.findByOtpAndRequestIdAndRequestType(otp, requestId, "SERVICE_REQUEST")
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));
        if (otpEntity.getExpiresAt().isBefore(LocalDateTime.now()) || otpEntity.isUsed()) {
            throw new RuntimeException("OTP has expired or already used");
        }

        otpEntity.setUsed(true);
        otpRepository.save(otpEntity);
    }

    @Override
    public boolean checkOTPStatus(Long requestId, String token) {
        AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, requestId, "SERVICE_REQUEST")
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        return otpRepository.findByRequestIdAndRequestTypeAndIsUsed(requestId, "SERVICE_REQUEST", true)
                .stream()
                .anyMatch(otp -> otp.getGuestEmail().equals(accessToken.getGuestEmail()) &&
                        !otp.getExpiresAt().isBefore(LocalDateTime.now()));
    }


    @Override
    public Page<ServiceRequestDTO> getAllRequests(String serviceName, Pageable pageable) {
        Page<ServiceRequest> requests = requestRepository.findWithFilters(serviceName, pageable);
        return requests.map(this::convertToDTO);
    }

    @Override
    public ServiceRequestDTO getRequestByIdAdmin(Long id) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        return convertToDTO(request);
    }

    @Override
    public ServiceRequestDTO updateRequestStatus(Long id, ServiceRequestStatus status) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        request.setStatus(status);
        request = requestRepository.save(request);

        if (status == ServiceRequestStatus.COMPLETED) {
            ServiceUsage serviceUsage = new ServiceUsage();
            serviceUsage.setBookings(request.getBooking());
            serviceUsage.setServices(request.getService());
            serviceUsage.setQuantity(request.getQuantity());
            serviceUsage.setTotalPrice(request.getTotalAmount());
            serviceUsage.setTimestamp(LocalDateTime.now());
            serviceUsageRepository.save(serviceUsage);
        }

        return convertToDTO(request);
    }

    private ServiceRequestDTO convertToDTO(ServiceRequest request) {
        ServiceRequestDTO dto = new ServiceRequestDTO();
        dto.setId(request.getId());
        dto.setCustomerId(request.getCustomer() != null ? request.getCustomer().getId() : null);
        dto.setCustomerName(request.getCustomer() != null ? request.getCustomer().getFullName() : request.getGuestName());
        dto.setBookingId(request.getBooking().getId());
        dto.setServiceId(request.getService().getId());
        dto.setServiceName(request.getService().getServiceName());
        dto.setQuantity(request.getQuantity());
        dto.setTotalAmount(request.getTotalAmount());
        dto.setStatus(request.getStatus());
        dto.setNotes(request.getNotes());
        dto.setGuestName(request.getGuestName());
        dto.setGuestEmail(request.getGuestEmail());
        dto.setCreatedAt(request.getCreatedAt());
        return dto;
    }
}
