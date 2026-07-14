package com.bomberoshn.usersAplications.DTO;

import com.bomberoshn.usersAplications.Entitys.AccionTipo;

public record AccionPermisoDTO(

        AccionTipo accion,
        boolean permitido

) {
}