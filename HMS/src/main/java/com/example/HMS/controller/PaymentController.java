package com.example.HMS.controller;

import com.example.HMS.utils.PaymentFactory;
import com.example.HMS.utils.PaymentServiceFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentServiceFacade paymentServiceFacade;
    private final PaymentFactory paymentFactory;

    @GetMapping("/providers")
    public ResponseEntity<List<String>> getAvailableProviders() {
        return ResponseEntity.ok(paymentFactory.getAvailableProviders());
    }

    @PostMapping("/{folioId}/initiate")
    public ResponseEntity<Map<String, Object>> initiatePayment(
            @PathVariable Long folioId,
            @RequestParam(defaultValue = "zalopay") String provider) {

        try {
            String paymentUrl = paymentServiceFacade.initiatePayment(folioId, provider);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("paymentUrl", paymentUrl);
            response.put("message", "Payment initiated successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{folioId}/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @PathVariable Long folioId,
            @RequestParam(defaultValue = "zalopay") String provider) {

        try {
            boolean success = paymentServiceFacade.verifyAndUpdatePayment(folioId, provider);

            Map<String, Object> response = new HashMap<>();
            response.put("status", success ? "success" : "failed");
            response.put("paid", success);
            response.put("message", success ? "Payment verified and folio updated" : "Payment not completed");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("paid", false);
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/transaction/{transactionId}/verify")
    public ResponseEntity<Map<String, Object>> verifyPaymentByTransaction(
            @PathVariable String transactionId,
            @RequestParam(defaultValue = "zalopay") String provider) {

        try {
            boolean success = paymentServiceFacade.verifyAndUpdatePaymentByTransaction(transactionId, provider);

            Map<String, Object> response = new HashMap<>();
            response.put("status", success ? "success" : "failed");
            response.put("paid", success);
            response.put("message", success ? "Payment verified and folio updated" : "Payment not completed or transaction not found");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("paid", false);
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }
}
