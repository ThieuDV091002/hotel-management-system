package com.example.HMS.dto;

import com.example.HMS.model.AmenityStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequest {
    private AmenityStatus status;
}
