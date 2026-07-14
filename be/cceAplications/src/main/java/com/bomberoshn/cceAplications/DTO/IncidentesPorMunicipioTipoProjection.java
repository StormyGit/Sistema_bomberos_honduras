package com.bomberoshn.cceAplications.DTO;

import java.util.UUID;

public interface IncidentesPorMunicipioTipoProjection {

    UUID getMunicipioId();

    String getMunicipio();

    UUID getTipoId();

    String getTipoNombre();

    Long getTotal();
}