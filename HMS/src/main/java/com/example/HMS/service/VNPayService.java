package com.example.HMS.service;

import com.example.HMS.config.VNPayConfig;
import com.example.HMS.model.Folio;
import com.example.HMS.model.FolioStatus;
import com.example.HMS.repository.FolioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class VNPayService {

    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private FolioRepository folioRepository;

    public String createPaymentUrl(Folio folio, String ipAddress) {
        String vnp_TxnRef = String.valueOf(folio.getId());
        String vnp_TmnCode = vnPayConfig.getVnpTmnCode();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnPayConfig.getVnpVersion());
        vnp_Params.put("vnp_Command", vnPayConfig.getVnpCommand());
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf((long) (folio.getTotalAmount() * 100)));
        vnp_Params.put("vnp_CurrCode", vnPayConfig.getVnpCurrCode());

        String orderInfo = "Thanh toan Folio ID: " + folio.getId() + " - Booking ID: " + folio.getBookings().getId();
        vnp_Params.put("vnp_OrderInfo", orderInfo);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
        vnp_Params.put("vnp_IpAddr", ipAddress);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        fieldNames.forEach(field -> {
            String fieldValue = vnp_Params.get(field);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                // Mã hóa giá trị cho hashData
                String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8);
                hashData.append(field).append("=").append(encodedValue);
                query.append(URLEncoder.encode(field, StandardCharsets.UTF_8)).append("=")
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                if (fieldNames.indexOf(field) < fieldNames.size() - 1) {
                    hashData.append("&");
                    query.append("&");
                }
            }
        });

        String vnp_SecureHash = hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);

        System.out.println("hashData: " + hashData.toString());
        System.out.println("vnp_SecureHash: " + vnp_SecureHash);
        System.out.println("Full URL: " + vnPayConfig.getVnpPayUrl() + "?" + query);

        return vnPayConfig.getVnpPayUrl() + "?" + query;
    }

    @Transactional
    public boolean processPaymentReturn(Map<String, String> vnpParams) {
        // Kiểm tra tính toàn vẹn của dữ liệu
        if (!validatePaymentData(vnpParams)) {
            return false;
        }

        // Kiểm tra trạng thái giao dịch
        String vnp_ResponseCode = vnpParams.get("vnp_ResponseCode");
        String vnp_TxnRef = vnpParams.get("vnp_TxnRef");

        if ("00".equals(vnp_ResponseCode)) { // Thanh toán thành công
            // Cập nhật trạng thái folio
            Long folioId = Long.parseLong(vnp_TxnRef);
            Folio folio = folioRepository.findById(folioId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Folio với ID: " + folioId));

            // Cập nhật trạng thái và thời gian
            folio.setStatus(FolioStatus.PAID);
            folio.setUpdatedAt(LocalDateTime.now());
            folioRepository.save(folio);

            return true;
        }

        return false;
    }

    private boolean validatePaymentData(Map<String, String> vnpParams) {
        // Tạo chuỗi để kiểm tra chữ ký
        String signValue = vnpParams.get("vnp_SecureHash");
        if (signValue == null) {
            return false;
        }

        // Xóa tham số chữ ký để tạo chuỗi hash mới
        vnpParams.remove("vnp_SecureHash");
        vnpParams.remove("vnp_SecureHashType");

        // Sắp xếp tham số
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        // Tạo chuỗi hash để kiểm tra
        StringBuilder hashData = new StringBuilder();

        fieldNames.forEach(field -> {
            if (!field.isEmpty()) {
                String fieldValue = vnpParams.get(field);
                if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                    hashData.append(field).append("=").append(fieldValue);

                    if (fieldNames.indexOf(field) < fieldNames.size() - 1) {
                        hashData.append("&");
                    }
                }
            }
        });

        // Tạo chữ ký để so sánh
        String vnp_SecureHash = hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());

        // So sánh chữ ký
        return vnp_SecureHash.equals(signValue);
    }

    // Phương thức tạo chữ ký HMAC_SHA512
    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), "HmacSHA512");
            hmac.init(secretKeySpec);
            byte[] result = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(result);
        } catch (Exception ex) {
            throw new RuntimeException("Lỗi tạo chữ ký HMAC SHA512", ex);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
