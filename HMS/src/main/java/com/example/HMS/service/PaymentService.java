package com.example.HMS.service;

import com.example.HMS.model.Folio;

public interface PaymentService {
    String createPayment(Folio folio);

    boolean verifyPayment(String transactionId);

    String getProviderName();
}
