package com.example.HMS.controller;

import com.example.HMS.model.Folio;
import com.example.HMS.repository.FolioRepository;
import com.example.HMS.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class VNPayController {
    private final VNPayService vnPayService;
    private final FolioRepository folioRepository;

    @PostMapping("/create-payment/{folioId}")
    public ResponseEntity<?> createPayment(@PathVariable Long folioId, HttpServletRequest request) {
        try {
            Folio folio = folioRepository.findById(folioId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Folio với ID: " + folioId));

            String ipAddress = request.getRemoteAddr();

            String paymentUrl = vnPayService.createPaymentUrl(folio, ipAddress);

            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(@RequestParam Map<String, String> queryParams) {
        try {
            boolean paymentSuccess = vnPayService.processPaymentReturn(queryParams);

            Map<String, Object> response = new HashMap<>();
            if (paymentSuccess) {
                response.put("status", "success");
                response.put("message", "Thanh toán thành công");
            } else {
                response.put("status", "failed");
                response.put("message", "Thanh toán thất bại hoặc bị hủy");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
