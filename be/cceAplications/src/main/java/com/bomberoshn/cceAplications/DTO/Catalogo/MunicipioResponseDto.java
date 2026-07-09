package com.bomberoshn.cceAplications.DTO.Catalogo;

import java.util.UUID;

public record MunicipioResponseDto(
        UUID id,
        String nombre,
        Short codigo,
        UUID departamentoId
) {
}