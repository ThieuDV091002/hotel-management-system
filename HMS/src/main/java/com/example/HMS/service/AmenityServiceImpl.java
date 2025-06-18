package com.example.HMS.service;

import com.example.HMS.dto.AmenityDTO;
import com.example.HMS.model.Amenity;
import com.example.HMS.exception.ResourceNotFoundException;
import com.example.HMS.repository.AmenityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AmenityServiceImpl implements AmenityService {

    private final AmenityRepository amenityRepository;

    @Override
    public Map<String, Object> getAllAmenities(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Amenity> amenityPage = amenityRepository.findAll(pageable);

        List<AmenityDTO> amenityDTOs = amenityPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("amenities", amenityDTOs);
        response.put("currentPage", amenityPage.getNumber());
        response.put("totalItems", amenityPage.getTotalElements());
        response.put("totalPages", amenityPage.getTotalPages());

        return response;
    }

    @Override
    public AmenityDTO getAmenityById(Long id) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity not found with id: " + id));
        return convertToDTO(amenity);
    }

    @Override
    public AmenityDTO createAmenity(AmenityDTO amenityDTO) {
        Amenity amenity = convertToEntity(amenityDTO);
        Amenity savedAmenity = amenityRepository.save(amenity);
        return convertToDTO(savedAmenity);
    }

    @Override
    public AmenityDTO updateAmenity(Long id, AmenityDTO amenityDTO) {
        Amenity existingAmenity = amenityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity not found with id: " + id));

        existingAmenity.setName(amenityDTO.getName());
        existingAmenity.setDescription(amenityDTO.getDescription());

        Amenity updatedAmenity = amenityRepository.save(existingAmenity);
        return convertToDTO(updatedAmenity);
    }

    @Override
    public void deleteAmenity(Long id) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity not found with id: " + id));
        amenityRepository.delete(amenity);
    }

    // Helper method: entity -> DTO
    private AmenityDTO convertToDTO(Amenity amenity) {
        return new AmenityDTO(amenity.getId(), amenity.getName(), amenity.getDescription());
    }

    // Helper method: DTO -> entity
    private Amenity convertToEntity(AmenityDTO amenityDTO) {
        Amenity amenity = new Amenity();
        amenity.setName(amenityDTO.getName());
        amenity.setDescription(amenityDTO.getDescription());
        return amenity;
    }
}
