package com.example.HMS.dto;

import com.example.HMS.model.FolioStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FolioDTO {
    private Long id;
    private Long bookingId;
    private String customerName;
    private Long userId;
    private String guestName;
    private String guestEmail;
    private double totalAmount;
    private FolioStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
