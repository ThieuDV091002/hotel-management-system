package com.example.HMS.service;

import com.example.HMS.model.AmenityAction;
import com.example.HMS.model.AmenityHistory;
import org.springframework.data.domain.Page;

public interface AmenityHistoryService {
    Page<AmenityHistory> getAllAmenityHistories(int pageNo, int pageSize);
    Page<AmenityHistory> getAmenityHistoriesBySourceRoom(Long roomId, int pageNo, int pageSize);
    Page<AmenityHistory> getAmenityHistoriesByDestinationRoom(Long roomId, int pageNo, int pageSize);
    Page<AmenityHistory> getAmenityHistoriesByAmenity(Long amenityId, int pageNo, int pageSize);
    Page<AmenityHistory> getAmenityHistoriesByAction(AmenityAction action, int pageNo, int pageSize);
    Page<AmenityHistory> findAmenityHistoriesByCriteria(Long amenityId, AmenityAction action, Long sourceRoomId, Long destinationRoomId, int pageNo, int pageSize);
    AmenityHistory getAmenityHistoryById(Long id);
    AmenityHistory createAmenityHistory(AmenityHistory amenityHistory);
    AmenityHistory updateAmenityHistory(Long id, AmenityHistory amenityHistoryDetails);
    void deleteAmenityHistory(Long id);
}
