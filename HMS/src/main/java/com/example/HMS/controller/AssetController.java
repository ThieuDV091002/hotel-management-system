package com.example.HMS.controller;

import com.example.HMS.dto.AssetDTO;
import com.example.HMS.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @PostMapping
    public ResponseEntity<AssetDTO> createAsset(@RequestBody AssetDTO assetDTO) {
        AssetDTO createdAsset = assetService.createAsset(assetDTO);
        return ResponseEntity.ok(createdAsset);
    }

    @GetMapping
    public ResponseEntity<Page<AssetDTO>> getAssets(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String condition,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AssetDTO> assets = assetService.getAssets(name, location, condition, pageable);
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetDTO> getAssetById(@PathVariable Integer id) {
        return assetService.getAssetById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetDTO> updateAsset(@PathVariable Integer id, @RequestBody AssetDTO assetDTO) {
        AssetDTO updatedAsset = assetService.updateAsset(id, assetDTO);
        return ResponseEntity.ok(updatedAsset);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Integer id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/condition")
    public ResponseEntity<AssetDTO> updateAssetCondition(@PathVariable Integer id, @RequestParam String condition) {
        AssetDTO updatedAsset = assetService.updateAssetCondition(id, condition);
        return ResponseEntity.ok(updatedAsset);
    }
}
