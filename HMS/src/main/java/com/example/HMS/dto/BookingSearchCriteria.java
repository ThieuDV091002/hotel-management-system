package com.example.HMS.dto;

import com.example.HMS.model.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingSearchCriteria {
    private String userFullName;
    private Date startDate;
    private Date endDate;
    private BookingStatus status;
}
