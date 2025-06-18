package com.example.HMS.controller;

import com.example.HMS.dto.AmenityDTO;
import com.example.HMS.service.AmenityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/amenities")
@RequiredArgsConstructor
public class AmenityController {

    private final AmenityService amenityService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAmenities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Map<String, Object> response = amenityService.getAllAmenities(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AmenityDTO> getAmenityById(@PathVariable Long id) {
        AmenityDTO amenityDTO = amenityService.getAmenityById(id);
        return ResponseEntity.ok(amenityDTO);
    }

    @PostMapping
    public ResponseEntity<AmenityDTO> createAmenity(@Valid @RequestBody AmenityDTO amenityDTO) {
        AmenityDTO createdAmenity = amenityService.createAmenity(amenityDTO);
        return new ResponseEntity<>(createdAmenity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AmenityDTO> updateAmenity(
            @PathVariable Long id,
            @Valid @RequestBody AmenityDTO amenityDTO) {

        AmenityDTO updatedAmenity = amenityService.updateAmenity(id, amenityDTO);
        return ResponseEntity.ok(updatedAmenity);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAmenity(@PathVariable Long id) {
        amenityService.deleteAmenity(id);
        return ResponseEntity.noContent().build();
    }
}

