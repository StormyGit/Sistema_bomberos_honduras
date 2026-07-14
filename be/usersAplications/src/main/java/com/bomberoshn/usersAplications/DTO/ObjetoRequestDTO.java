package com.bomberoshn.usersAplications.DTO;

import com.bomberoshn.usersAplications.Utils.enums.ObjetoTipo;

public record ObjetoRequestDTO(

        String nombre,

        ObjetoTipo tipo

) {
}