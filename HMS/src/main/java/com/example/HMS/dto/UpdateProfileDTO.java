package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileDTO {
    private String fullName;
    private String phoneNumber;
    private String email;
    private String address;
}
