package com.example.HMS.controller;

import com.example.HMS.service.DataGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
public class DataGeneratorController {
    private final DataGeneratorService dataGeneratorService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateData() {
        try {
            dataGeneratorService.generateData();
            return ResponseEntity.ok("Data generated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating data: " + e.getMessage());
        }
    }
}
