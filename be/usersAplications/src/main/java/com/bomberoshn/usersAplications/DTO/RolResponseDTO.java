package com.bomberoshn.usersAplications.DTO;

import java.util.UUID;

public record RolResponseDTO(
        UUID id,
        String codigo,
        String nombre,
        String descripcion
) {
}