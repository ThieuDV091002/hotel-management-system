package com.example.HMS.service;

import com.example.HMS.config.ZalopayConfig;
import com.example.HMS.model.Folio;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ZaloPayService implements PaymentService{
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public ZaloPayService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String createPayment(Folio folio) {
        try {
            String transactionId = generateTransactionId(folio);

            Map<String, Object> order = new HashMap<>();
            order.put("app_id", Integer.parseInt(ZalopayConfig.config.get("app_id")));
            order.put("app_trans_id", transactionId);
            String appUser = folio.getUser() != null
                    ? folio.getUser().getId().toString()
                    : "guest-" + folio.getGuestEmail();
            order.put("app_user", appUser);
            order.put("app_time", System.currentTimeMillis());
            order.put("amount", (long) folio.getTotalAmount());
            order.put("description", "Thanh toan don hang #" + folio.getId());
            order.put("bank_code", "");
            order.put("item", "[]");

            Map<String, Object> embedData = new HashMap<>();
            embedData.put("redirecturl", "http://localhost:5173/transactions/" + folio.getId() );
            order.put("embed_data", objectMapper.writeValueAsString(embedData));

            String data = order.get("app_id") + "|" + order.get("app_trans_id") + "|" +
                    order.get("app_user") + "|" + order.get("amount") + "|" +
                    order.get("app_time") + "|" + order.get("embed_data") + "|" +
                    order.get("item");

            String mac = hmacSHA256(data, ZalopayConfig.config.get("key1"));
            order.put("mac", mac);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(order, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    ZalopayConfig.config.get("endpoint"),
                    request,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Integer returnCode = (Integer) responseBody.get("return_code");

                if (returnCode != null && returnCode == 1) {
                    return (String) responseBody.get("order_url");
                } else {
                    throw new RuntimeException("ZaloPay API error: " + responseBody.get("return_message"));
                }
            } else {
                throw new RuntimeException("Failed to call ZaloPay API");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to create ZaloPay payment", e);
        }
    }

    @Override
    public boolean verifyPayment(String transactionId) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("app_id", Integer.parseInt(ZalopayConfig.config.get("app_id")));
            params.put("app_trans_id", transactionId);

            String data = params.get("app_id") + "|" + params.get("app_trans_id") + "|" +
                    ZalopayConfig.config.get("key1");
            String mac = hmacSHA256(data, ZalopayConfig.config.get("key1"));
            params.put("mac", mac);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(params, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    ZalopayConfig.config.get("orderstatus"),
                    request,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Integer returnCode = (Integer) responseBody.get("return_code");
                return returnCode != null && returnCode == 1;
            }

            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String getProviderName() {
        return "ZaloPay";
    }

    private String generateTransactionId(Folio folio) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyMMdd");
        String dateStr = formatter.format(new Date());
        return dateStr + "_" + ZalopayConfig.config.get("app_id") + "_" + folio.getId();
    }

    private String hmacSHA256(String data, String key) throws Exception {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder result = new StringBuilder();
        for (byte b : hash) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
