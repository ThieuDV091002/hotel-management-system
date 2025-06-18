package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetDTO {
    private Integer id;
    private String name;
    private String location;
    private Date maintainDate;
    private String condition;
}
