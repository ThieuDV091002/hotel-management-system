package com.example.HMS.service;

import com.example.HMS.dto.FolioDTO;
import com.example.HMS.dto.FolioResponseDTO;
import com.example.HMS.model.FolioStatus;
import com.example.HMS.model.Role;
import org.springframework.data.domain.Page;

public interface FolioService {
    Page<FolioDTO> getAllFolios(int page, int size, String search);
    FolioResponseDTO getFolioDetails(Long folioId, Long customerId, Role role, String token);
    FolioDTO updateFolioStatus(Long folioId, FolioStatus status);
    Page<FolioDTO> getUserFolios(Long userId, int page, int size);
    FolioDTO createFolio(Long bookingId);
    FolioDTO getFolioByBookingId(Long bookingId);
}
