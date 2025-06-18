package com.example.HMS.service;

import com.example.HMS.dto.AmenityDTO;
import com.example.HMS.model.Amenity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface AmenityService {
    Map<String, Object> getAllAmenities(int page, int size);
    AmenityDTO getAmenityById(Long id);
    AmenityDTO createAmenity(AmenityDTO amenityDTO);
    AmenityDTO updateAmenity(Long id, AmenityDTO amenityDTO);
    void deleteAmenity(Long id);
}
