package com.bomberoshn.usersAplications.DTO;

import com.bomberoshn.usersAplications.Utils.enums.ObjetoTipo;

import java.util.UUID;

public record ObjetoResponseDTO(

        UUID id,

        String nombre,

        ObjetoTipo tipo

) {
}