package com.bomberoshn.usersAplications.DTO;

import com.bomberoshn.usersAplications.Entitys.ObjetoTipo;

public record ObjetoRequestDTO(

        String nombre,

        ObjetoTipo tipo

) {
}