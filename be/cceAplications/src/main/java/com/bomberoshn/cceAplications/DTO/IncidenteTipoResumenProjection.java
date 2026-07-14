package com.bomberoshn.cceAplications.DTO;

import java.util.UUID;

public interface IncidenteTipoResumenProjection {

    UUID getTipoId();

    String getTipoNombre();

    Long getTotal();
}