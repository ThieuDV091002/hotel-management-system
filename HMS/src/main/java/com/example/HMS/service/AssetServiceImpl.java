package com.example.HMS.service;

import com.example.HMS.dto.AssetDTO;
import com.example.HMS.model.Asset;
import com.example.HMS.model.AssetCondition;
import com.example.HMS.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;

    @Override
    public AssetDTO createAsset(AssetDTO assetDTO) {
        Asset asset = Asset.builder()
                .name(assetDTO.getName())
                .location(assetDTO.getLocation())
                .maintainDate(assetDTO.getMaintainDate())
                .condition(AssetCondition.valueOf(assetDTO.getCondition()))
                .build();

        Asset savedAsset = assetRepository.save(asset);
        return mapToDTO(savedAsset);
    }

    @Override
    public Page<AssetDTO> getAssets(String name, String location, String condition, Pageable pageable) {
        Page<Asset> assets;
        if (name != null && !name.isEmpty() && location != null && !location.isEmpty()) {
            assets = assetRepository.findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(name, location, pageable);
        } else if (name != null && !name.isEmpty()) {
            assets = assetRepository.findByNameContainingIgnoreCase(name, pageable);
        } else if (location != null && !location.isEmpty()) {
            assets = assetRepository.findByLocationContainingIgnoreCase(location, pageable);
        } else if (condition != null && !condition.isEmpty()) {
            assets = assetRepository.findByCondition(AssetCondition.valueOf(condition), pageable);
        } else {
            assets = assetRepository.findAll(pageable);
        }
        return assets.map(this::mapToDTO);
    }

    @Override
    public Optional<AssetDTO> getAssetById(Integer id) {
        return assetRepository.findById(id).map(this::mapToDTO);
    }

    @Override
    public AssetDTO updateAsset(Integer id, AssetDTO assetDTO) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        asset.setName(assetDTO.getName());
        asset.setLocation(assetDTO.getLocation());
        asset.setMaintainDate(assetDTO.getMaintainDate());
        asset.setCondition(AssetCondition.valueOf(assetDTO.getCondition()));

        Asset updatedAsset = assetRepository.save(asset);
        return mapToDTO(updatedAsset);
    }

    @Override
    public void deleteAsset(Integer id) {
        if (!assetRepository.existsById(id)) {
            throw new RuntimeException("Asset not found");
        }
        assetRepository.deleteById(id);
    }

    @Override
    public AssetDTO updateAssetCondition(Integer id, String condition) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        asset.setCondition(AssetCondition.valueOf(condition));
        Asset updatedAsset = assetRepository.save(asset);
        return mapToDTO(updatedAsset);
    }

    private AssetDTO mapToDTO(Asset asset) {
        return AssetDTO.builder()
                .id(asset.getId())
                .name(asset.getName())
                .location(asset.getLocation())
                .maintainDate(asset.getMaintainDate())
                .condition(asset.getCondition().name())
                .build();
    }
}
