package com.example.HMS.service;

import com.example.HMS.dto.FeedbackDTO;
import com.example.HMS.model.*;
import com.example.HMS.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final CustomerRepository customerRepository;
    private final BookingsRepository bookingRepository;
    private final AccessTokenRepository accessTokenRepository;
    private final OTPRepository otpRepository;
    private final JavaMailSender mailSender;

    @Override
    public FeedbackDTO createFeedback(FeedbackDTO feedbackDTO, Long customerId) {
        Customer customer = null;
        String guestName = null;
        String guestEmail = null;

        if (customerId != null) {
            customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
        } else {
            if (feedbackDTO.getGuestName() == null || feedbackDTO.getGuestEmail() == null) {
                throw new RuntimeException("Guest name and email are required for non-logged-in users");
            }
            guestName = feedbackDTO.getGuestName();
            guestEmail = feedbackDTO.getGuestEmail();
        }
        Bookings booking = bookingRepository.findById(Math.toIntExact(feedbackDTO.getBookingId()))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Feedback feedback = Feedback.builder()
                .customer(customer)
                .guestName(guestName)
                .guestEmail(guestEmail)
                .booking(booking)
                .rating(feedbackDTO.getRating())
                .comment(feedbackDTO.getComment())
                .dateTime(LocalDateTime.now())
                .build();

        Feedback savedFeedback = feedbackRepository.save(feedback);
        if (customer != null) {
            sendFeedbackEmail(customer.getEmail(), savedFeedback, customer.getFullName());
        } else {
            String newToken = UUID.randomUUID().toString();
            AccessToken accessToken = AccessToken.builder()
                    .token(newToken)
                    .requestId(savedFeedback.getId())
                    .requestType("FEEDBACK")
                    .guestEmail(guestEmail)
                    .expiresAt(LocalDateTime.now().plusHours(24))
                    .build();
            accessTokenRepository.save(accessToken);
            sendFeedbackEmail(guestEmail, savedFeedback, newToken, guestName);
        }

        return mapToDTO(savedFeedback);
    }

    private void sendFeedbackEmail(String email, Feedback feedback, String name) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(email);
        mail.setSubject("Feedback Confirmation");
        mail.setText("Dear " + name + ",\n\n" +
                "Thank you for your feedback:\n" +
                "Feedback ID: " + feedback.getId() + "\n" +
                "Booking ID: " + feedback.getBooking().getId() + "\n" +
                "Rating: " + feedback.getRating() + "\n" +
                "Comment: " + feedback.getComment() + "\n\n" +
                "We appreciate your input!");
        mailSender.send(mail);
    }

    private void sendFeedbackEmail(String email, Feedback feedback, String token, String guestName) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(email);
        mail.setSubject("Feedback Confirmation");
        mail.setText("Dear " + guestName + ",\n\n" +
                "Thank you for your feedback:\n" +
                "Feedback ID: " + feedback.getId() + "\n" +
                "Booking ID: " + feedback.getBooking().getId() + "\n" +
                "Rating: " + feedback.getRating() + "\n" +
                "Comment: " + feedback.getComment() + "\n\n" +
                "View your feedback: http://localhost:5173/reviews/" + feedback.getId() + "?token=" + token + "\n\n" +
                "We appreciate your input!");
        mailSender.send(mail);
    }

    @Override
    public Page<FeedbackDTO> getMyFeedback(Long customerId, Long bookingId, Integer rating, Pageable pageable) {
        Page<Feedback> feedback;
        if (bookingId != null) {
            feedback = feedbackRepository.findByBookingId(bookingId, pageable);
        } else if (rating != null) {
            feedback = feedbackRepository.findByRating(rating, pageable);
        } else {
            feedback = feedbackRepository.findByCustomerId(customerId, pageable);
        }
        return feedback.map(this::mapToDTO);
    }

    @Override
    public Page<FeedbackDTO> getAllFeedback(String customerName, Long bookingId, Integer rating, Pageable pageable) {
        Page<Feedback> feedback = feedbackRepository.searchFeedback(customerName, bookingId, rating, pageable);
        return feedback.map(this::mapToDTO);
    }


    @Override
    public Optional<FeedbackDTO> getFeedbackById(Long id, Long customerId, Role role, String token) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        if (role != null) {
            if (role == Role.ADMIN) {
            } else {
                if (feedback.getCustomer() == null || !feedback.getCustomer().getId().equals(customerId)) {
                    throw new RuntimeException("You are not authorized to view this feedback");
                }
            }
        } else {
            if (token == null) {
                throw new RuntimeException("Token is required for guest users");
            }
            AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, id, "FEEDBACK")
                    .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
            if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Token has expired");
            }
            if (!accessToken.getGuestEmail().equals(feedback.getGuestEmail())) {
                throw new RuntimeException("Unauthorized access");
            }
        }

        return Optional.of(mapToDTO(feedback));
    }


    @Override
    public void deleteFeedback(Long id, Long customerId, String token) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        if (customerId != null) {
            if (feedback.getCustomer() == null || !feedback.getCustomer().getId().equals(customerId)) {
                throw new RuntimeException("You are not authorized to delete this feedback");
            }
        } else {
            if (token == null) {
                throw new RuntimeException("Token is required for guest users");
            }
            AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, id, "FEEDBACK")
                    .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
            if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Token has expired");
            }
            boolean hasValidOTP = otpRepository.findByRequestIdAndRequestTypeAndIsUsed(id, "FEEDBACK", true)
                    .stream().anyMatch(otp -> otp.getGuestEmail().equals(feedback.getGuestEmail()) &&
                            !otp.getExpiresAt().isBefore(LocalDateTime.now()));
            if (!hasValidOTP) {
                throw new RuntimeException("No valid OTP found");
            }
        }

        feedbackRepository.deleteById(id);
    }

    @Override
    public FeedbackDTO updateFeedback(Long id, FeedbackDTO feedbackDTO, Long customerId, String token) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        if (customerId != null) {
            if (feedback.getCustomer() == null || !feedback.getCustomer().getId().equals(customerId)) {
                throw new RuntimeException("You are not authorized to update this feedback");
            }
        } else {
            if (token == null) {
                throw new RuntimeException("Token is required for guest users");
            }
            AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, id, "FEEDBACK")
                    .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
            if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Token has expired");
            }
            boolean hasValidOTP = otpRepository.findByRequestIdAndRequestTypeAndIsUsed(id, "FEEDBACK", true)
                    .stream().anyMatch(otp -> otp.getGuestEmail().equals(feedback.getGuestEmail()) &&
                            !otp.getExpiresAt().isBefore(LocalDateTime.now()));
            if (!hasValidOTP) {
                throw new RuntimeException("No valid OTP found");
            }
        }

        if (feedbackDTO.getRating() != null) {
            feedback.setRating(feedbackDTO.getRating());
        }
        if (feedbackDTO.getComment() != null) {
            feedback.setComment(feedbackDTO.getComment());
        }
        feedback.setDateTime(LocalDateTime.now());
        Feedback updatedFeedback = feedbackRepository.save(feedback);
        return mapToDTO(updatedFeedback);
    }

    @Override
    public List<FeedbackDTO> getLatestFeedbacks(int limit) {
        return feedbackRepository.findTop15ByOrderByDateTimeDesc()
                .stream()
                .limit(limit)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void requestOTP(Long feedbackId, String token) {
        AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, feedbackId, "FEEDBACK")
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        String otp = generateRandomOTP(6);
        OTP otpEntity = OTP.builder()
                .otp(otp)
                .guestEmail(accessToken.getGuestEmail())
                .requestId(feedbackId)
                .requestType("FEEDBACK")
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
    public void verifyOTP(Long feedbackId, String token, String otp) {
        AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, feedbackId, "FEEDBACK")
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        OTP otpEntity = otpRepository.findByOtpAndRequestIdAndRequestType(otp, feedbackId, "FEEDBACK")
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));
        if (otpEntity.getExpiresAt().isBefore(LocalDateTime.now()) || otpEntity.isUsed()) {
            throw new RuntimeException("OTP has expired or already used");
        }

        otpEntity.setUsed(true);
        otpRepository.save(otpEntity);
    }

    @Override
    public boolean checkOTPStatus(Long feedbackId, String token) {
        AccessToken accessToken = accessTokenRepository.findByTokenAndRequestIdAndRequestType(token, feedbackId, "FEEDBACK")
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        return otpRepository.findByRequestIdAndRequestTypeAndIsUsed(feedbackId, "FEEDBACK", true)
                .stream()
                .anyMatch(otp -> otp.getGuestEmail().equals(accessToken.getGuestEmail()) &&
                        !otp.getExpiresAt().isBefore(LocalDateTime.now()));
    }

    private FeedbackDTO mapToDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setId(feedback.getId());
        dto.setCustomerId(feedback.getCustomer() != null ? feedback.getCustomer().getId() : null);
        dto.setCustomerName(feedback.getCustomer() != null ? feedback.getCustomer().getFullName() : feedback.getGuestName());
        dto.setGuestName(feedback.getGuestName());
        dto.setGuestEmail(feedback.getGuestEmail());
        dto.setBookingId(feedback.getBooking().getId());
        dto.setRating(feedback.getRating());
        dto.setComment(feedback.getComment());
        dto.setDateTime(feedback.getDateTime());
        return dto;
    }
}
