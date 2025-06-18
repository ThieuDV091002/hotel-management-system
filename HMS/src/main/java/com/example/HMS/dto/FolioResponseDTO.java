package com.example.HMS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FolioResponseDTO {
    private FolioDTO folio;
    private List<FolioChargesDTO> folioCharges;
}
