package com.bomberoshn.usersAplications.DTO;

import com.bomberoshn.usersAplications.Utils.enums.UsuarioTipo;

import java.util.UUID;

public record UsuarioResponseDTO(

        UUID id,

        String nombre,

        String apellido,

        String correoOrCodigo,

        UsuarioTipo tipo,

        UUID departamentoId,

        String departamentoNombre,

        UUID estacionId,

        String estacionNombre,

        UUID rolId,

        String rolCodigo,

        String rolNombre

) {
}