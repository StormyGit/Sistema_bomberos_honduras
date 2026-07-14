package com.bomberoshn.cceAplications.DTO;

import java.util.UUID;

public record EstacionUpdateRequestDTO(

        String nombre,

        UUID regionalId,

        UUID departamentoId,

        UUID municipioId,

        boolean central,

        String point

) {
}