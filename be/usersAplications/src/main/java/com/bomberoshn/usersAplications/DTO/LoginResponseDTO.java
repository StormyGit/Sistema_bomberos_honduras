package com.bomberoshn.usersAplications.DTO;

public record LoginResponseDTO(
        String token,
        UsuarioResponseDTO usuario
) {
}