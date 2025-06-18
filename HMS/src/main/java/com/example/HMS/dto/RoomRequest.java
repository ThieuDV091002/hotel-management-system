package com.example.HMS.dto;

import com.example.HMS.model.RoomStatus;
import com.example.HMS.model.RoomType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomRequest {
    private String roomName;
    private String description;
    private String price;
    private Integer capacity;
    private RoomType roomType;
    private RoomStatus roomStatus;
    private List<Long> amenityIds;
    private List<Integer> quantities;
}
