package com.example.HMS.dto;

import com.example.HMS.model.AmenityAction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AmenityHistoryUpdateRequest {
    private Long amenityId;
    private AmenityAction action;
    private Long sourceRoomId;
    private Long destinationRoomId;
    private Integer quantity;
    private LocalDateTime timestamp;
}
