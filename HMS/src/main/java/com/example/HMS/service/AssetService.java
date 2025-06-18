package com.example.HMS.service;

import com.example.HMS.dto.AssetDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface AssetService {
    AssetDTO createAsset(AssetDTO assetDTO);
    Page<AssetDTO> getAssets(String name, String location, String condition, Pageable pageable);
    Optional<AssetDTO> getAssetById(Integer id);
    AssetDTO updateAsset(Integer id, AssetDTO assetDTO);
    void deleteAsset(Integer id);
    AssetDTO updateAssetCondition(Integer id, String condition);
}
