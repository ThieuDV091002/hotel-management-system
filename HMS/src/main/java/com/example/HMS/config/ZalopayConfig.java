package com.example.HMS.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class ZalopayConfig {
    public static final Map<String, String> config = new HashMap<String, String>() {
        {
            put("app_id", "2554");
            put("key1", "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn");
            put("key2", "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf");
            put("endpoint", "https://sb-openapi.zalopay.vn/v2/create");
            put("orderstatus", "https://sb-openapi.zalopay.vn/v2/query");
        }
    };

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
