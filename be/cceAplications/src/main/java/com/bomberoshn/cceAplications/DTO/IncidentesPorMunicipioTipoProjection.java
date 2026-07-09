package com.bomberoshn.cceAplications.DTO;

import java.util.UUID;

public interface IncidentesPorMunicipioTipoProjection {

    UUID getMunicipioId();

    String getMunicipio();

    String getIncidente();

    Long getTotal();
}