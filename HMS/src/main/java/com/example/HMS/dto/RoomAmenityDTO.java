package com.example.HMS.dto;

import com.example.HMS.model.AmenityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomAmenityDTO {
    private Long id;
    private Long amenityId;
    private String amenityName;
    private AmenityStatus status;
    private Integer quantity;
}
