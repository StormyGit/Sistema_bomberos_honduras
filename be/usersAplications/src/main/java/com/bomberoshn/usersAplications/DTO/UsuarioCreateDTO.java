package com.bomberoshn.usersAplications.DTO;

import com.bomberoshn.usersAplications.Entitys.UsuarioTipo;

import java.util.UUID;

public record UsuarioCreateDTO(

        String nombre,

        String apellido,

        String correoOrCodigo,

        String password,

        UUID departamentoId,

        UUID estacionId,

        UUID rolId,

        UsuarioTipo tipo

) {
}