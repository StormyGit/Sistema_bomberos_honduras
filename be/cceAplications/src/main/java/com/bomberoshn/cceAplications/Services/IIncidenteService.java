package com.bomberoshn.cceAplications.Services;

import com.bomberoshn.cceAplications.DTO.*;
import com.bomberoshn.cceAplications.Entitys.TiempoTipo;

import java.util.List;
import java.util.UUID;

public interface IIncidenteService {
    public List<IncidenteDTO> getAll();
    public IncidenteDTO getById(UUID id);
    public IncidenteDTO create(IncidenteDTO dto);
    public IncidenteDTO update(UUID id, IncidenteDTO dto);

    public RecursoDTO addRecurso(UUID idIncidente, RecursoDTO dto);
    public TiempoDTO addTimer(UUID idIncidente, TiempoTipo tipoTiempo);
    public TiempoDTO getTimer(UUID idIncidente, TiempoTipo tipoTiempo);
    public void addEvidencia(UUID idIncidente, UUID idArchivo);
    public List<IncidenteDTO> buscarIncidentes(SearchIncidenteDTO filtros);
    public List<IncidenteTipoResumenDTO> resumenIncidentesPorTipo(SearchIncidenteDTO filtros);
    public List<IncidenteMunicipioTipoResumenDTO> resumenIncidentesPorMunicipios(SearchIncidenteDTO filtros);
    public IncidenteEstadoResumenDTO resumenIncidentesPorEstado(SearchIncidenteDTO filtros);
    List<IncidenteTipoResponseDTO> buscar_tipo(String buscar);
}
