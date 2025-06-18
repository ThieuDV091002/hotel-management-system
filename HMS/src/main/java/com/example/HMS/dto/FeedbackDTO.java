package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private String guestName;
    private String guestEmail;
    private Long bookingId;
    private Integer rating;
    private String comment;
    private LocalDateTime dateTime;
}
