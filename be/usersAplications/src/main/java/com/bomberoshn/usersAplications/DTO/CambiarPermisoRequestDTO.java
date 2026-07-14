package com.bomberoshn.usersAplications.DTO;

import com.bomberoshn.usersAplications.Entitys.AccionTipo;

import java.util.UUID;

public record CambiarPermisoRequestDTO(

        UUID rolId,

        UUID objetoId,

        AccionTipo accion,

        boolean permitido

) {
}