package com.bomberoshn.cceAplications.Services;

import com.bomberoshn.cceAplications.DTO.IncidenteDTO;
import com.bomberoshn.cceAplications.DTO.RecursoDTO;
import com.bomberoshn.cceAplications.DTO.TiempoDTO;
import com.bomberoshn.cceAplications.Entitys.TiempoTipo;

import java.util.List;
import java.util.UUID;

public interface IIncidenteService {
    public List<IncidenteDTO> getAll();
    public IncidenteDTO create(IncidenteDTO dto);
    public IncidenteDTO update(UUID id, IncidenteDTO dto);

    public RecursoDTO addRecurso(UUID idIncidente, RecursoDTO dto);
    public TiempoDTO addTimer(UUID idIncidente, TiempoTipo tipoTiempo);
    public TiempoDTO getTimer(UUID idIncidente, TiempoTipo tipoTiempo);
    public void addEvidencia(UUID idIncidente, UUID idArchivo);
}
