package com.example.HMS.repository;

import com.example.HMS.model.RoomAmenity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomAmenityRepository extends CrudRepository<RoomAmenity, Long> {
    List<RoomAmenity> findByRoomId(Long roomId);
    Optional<RoomAmenity> findByRoomIdAndAmenityId(Long roomId, Long amenityId);
}
