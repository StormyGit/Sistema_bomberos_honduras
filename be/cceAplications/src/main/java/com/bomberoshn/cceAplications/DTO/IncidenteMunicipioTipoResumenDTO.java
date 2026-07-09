package com.bomberoshn.cceAplications.DTO;

import com.bomberoshn.cceAplications.Entitys.IncidenteTipo;

import java.util.UUID;

public record IncidenteMunicipioTipoResumenDTO(
        UUID municipioId,
        String municipio,
        IncidenteTipo incidente,
        String incidenteNombre,
        Long total
) {
}
