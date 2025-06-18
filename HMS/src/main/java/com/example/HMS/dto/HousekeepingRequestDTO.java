package com.example.HMS.dto;

import com.example.HMS.model.HousekeepingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HousekeepingRequestDTO {
    private Long id;
    private Long roomId;
    private String roomName;
    private Long customerId;
    private String customerName;
    private String guestName;
    private String guestEmail;
    private HousekeepingStatus status;
    private String notes;
    private LocalDateTime preferredTime;
    private LocalDateTime createdAt;
}
