package com.bomberoshn.cceAplications.DTO;

import java.util.UUID;

public record IncidenteTipoResponseDTO(
        UUID id,
        String nombre,
        String urlImagen,
        String indexReporte
) {
}