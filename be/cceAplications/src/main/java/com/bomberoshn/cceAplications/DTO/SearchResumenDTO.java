package com.bomberoshn.cceAplications.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
//@AllArgsConstructor
@NoArgsConstructor
public class SearchResumenDTO {
    private List<IncidenteDTO>  Incidentes;
    private List<IncidenteTipoResumenDTO> TipoResumen;
    private List<IncidenteMunicipioTipoResumenDTO> tipoAndMunicipios;
    private IncidenteEstadoResumenDTO incidenteEstadoResumenDTO;
}
