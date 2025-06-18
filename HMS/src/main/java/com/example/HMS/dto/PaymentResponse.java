package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentResponse {
    private boolean success;
    private String paymentUrl;
    private String transactionId;
    private String errorMessage;
    private PaymentStatus status;
}
