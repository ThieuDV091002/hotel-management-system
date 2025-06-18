package com.example.HMS.repository;

import com.example.HMS.model.AmenityAction;
import com.example.HMS.model.AmenityHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AmenityHistoryRepository extends CrudRepository<AmenityHistory, Long> {
    Page<AmenityHistory> findByAmenityId(Long amenityId, Pageable pageable);
    Page<AmenityHistory> findBySourceRoomId(Long sourceRoomId, Pageable pageable);
    Page<AmenityHistory> findByDestinationRoomId(Long destinationRoomId, Pageable pageable);
    Page<AmenityHistory> findByAction(AmenityAction action, Pageable pageable);
    Page<AmenityHistory> findAll(Pageable pageable);

    @Query("SELECT ah FROM AmenityHistory ah WHERE " +
            "(:amenityId IS NULL OR ah.amenity.id = :amenityId) AND " +
            "(:action IS NULL OR ah.action = :action) AND " +
            "(:sourceRoomId IS NULL OR ah.sourceRoom.id = :sourceRoomId) AND " +
            "(:destinationRoomId IS NULL OR ah.destinationRoom.id = :destinationRoomId)")
    Page<AmenityHistory> findByCriteria(@Param("amenityId") Long amenityId,
                                        @Param("action") AmenityAction action,
                                        @Param("sourceRoomId") Long sourceRoomId,
                                        @Param("destinationRoomId") Long destinationRoomId,
                                        Pageable pageable);
}
