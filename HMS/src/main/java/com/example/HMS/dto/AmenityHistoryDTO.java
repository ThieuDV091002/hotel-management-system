package com.example.HMS.dto;

import com.example.HMS.model.AmenityAction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AmenityHistoryDTO {
    private Long id;
    private String roomName;
    private Long amenityId;
    private String amenityName;
    private AmenityAction action;
    private Long sourceRoomId;
    private String sourceRoomName;
    private Long destinationRoomId;
    private String destinationRoomName;
    private Integer quantity;
    private LocalDateTime timestamp;
}
