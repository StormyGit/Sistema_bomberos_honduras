package com.bomberoshn.cceAplications.DTO;

import java.util.UUID;

public record IncidenteMunicipioTipoResumenDTO(
        UUID municipioId,
        String municipio,
        UUID tipoId,
        String tipoNombre,
        Long total
) {
}