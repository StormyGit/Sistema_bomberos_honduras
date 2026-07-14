package com.bomberoshn.usersAplications.DTO;

import com.bomberoshn.usersAplications.Utils.enums.AccionTipo;

public record AccionPermisoDTO(

        AccionTipo accion,
        boolean permitido

) {
}