package com.bomberoshn.cceAplications.DTO.Catalogo;

import java.util.UUID;

public record EstacionResponseDTO(
        UUID id,
        String nombre,
        boolean central,
        String departamento,
        String municipio,
        UUID departamentoId,
        UUID municipioId,
        String point
) {
}
