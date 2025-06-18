package com.example.HMS.utils;

import com.example.HMS.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class PaymentFactory {

    private final Map<String, PaymentService> paymentServices = new HashMap<>();

    @Autowired
    public PaymentFactory(List<PaymentService> serviceList) {
        for (PaymentService service : serviceList) {
            paymentServices.put(service.getProviderName().toLowerCase(), service);
        }
    }

    public PaymentService getPaymentService(String providerName) {
        PaymentService service = paymentServices.get(providerName.toLowerCase());
        if (service == null) {
            throw new IllegalArgumentException("Unsupported payment provider: " + providerName);
        }
        return service;
    }

    public List<String> getAvailableProviders() {
        return paymentServices.keySet().stream().toList();
    }
}
