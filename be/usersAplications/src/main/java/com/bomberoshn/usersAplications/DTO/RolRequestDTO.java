package com.bomberoshn.usersAplications.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RolRequestDTO(

        @NotBlank(message = "El código del rol es obligatorio")
        @Size(max = 100, message = "El código no puede superar los 100 caracteres")
        String codigo,

        @NotBlank(message = "El nombre del rol es obligatorio")
        String nombre,

        String descripcion
) {
}