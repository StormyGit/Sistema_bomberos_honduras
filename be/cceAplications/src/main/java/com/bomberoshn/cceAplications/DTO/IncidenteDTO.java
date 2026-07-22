package com.bomberoshn.cceAplications.DTO;

import com.bomberoshn.cceAplications.Entitys.Catalogo.IncidenteTipoEntity;
import com.bomberoshn.cceAplications.Entitys.IncidenteEstado;
import com.bomberoshn.cceAplications.Entitys.IncidenteRecepcion;
import com.bomberoshn.cceAplications.Entitys.ReporteIncidenteEntity;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidenteDTO {

    private UUID id;
    private String incidente;
    private UUID incidenteTipoId;
    private String reportByIncidente;
    private UUID idParent;
    private IncidenteEstado estado;
    private String departamento;
    private String colonia;
    private String referencia;
    private String direccion;
    private Boolean isAnonimo;
    private String denuncianteNombre;
    private String denuncianteTelefono;
    private LocalDate recepcionFecha;
    private String recepcionNombre;
    private IncidenteRecepcion recepcionTipo;
    private String point;
    private Boolean isFalsaAlarma;
    private String observacionGeneral;
    private LocalDateTime fechaCreacion;
    private String fecha;
    private List<RecursoDTO> recursos;
    private List<TiempoDTO> tiempos;
    private List<ArchivoDTO> images;
    private ReporteIncidenteEntity reporte;
}