package com.example.HMS.repository;

import com.example.HMS.model.Asset;
import com.example.HMS.model.AssetCondition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Integer> {
    Page<Asset> findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(String name, String location, Pageable pageable);
    Page<Asset> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Asset> findByLocationContainingIgnoreCase(String location, Pageable pageable);
    Page<Asset> findByCondition(AssetCondition condition, Pageable pageable);
}
