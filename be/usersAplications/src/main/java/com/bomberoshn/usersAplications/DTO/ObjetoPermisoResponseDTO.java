package com.bomberoshn.usersAplications.DTO;

import com.bomberoshn.usersAplications.Entitys.ObjetoTipo;

import java.util.List;
import java.util.UUID;

public record ObjetoPermisoResponseDTO(

        UUID objetoId,

        String nombre,

        ObjetoTipo tipo,

        UUID padreId,

        String padreNombre,

        List<AccionPermisoDTO> acciones

) {
}