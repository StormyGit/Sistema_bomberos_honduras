package com.bomberoshn.cceAplications.DTO.Catalogo;

import java.util.UUID;

public record DepartamentoResponseDto(
        UUID id,
        String nombre,
        Byte codigo
) {
}