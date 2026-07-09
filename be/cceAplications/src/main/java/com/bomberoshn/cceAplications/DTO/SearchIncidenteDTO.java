package com.bomberoshn.cceAplications.DTO;

import com.bomberoshn.cceAplications.Entitys.IncidenteTipo;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class SearchIncidenteDTO {
    private String buscar;
    private UUID idEstacion;
    @JsonProperty("isFinalizado")
    private Boolean finalizado = false;

    private LocalDate fecha_Final;
    private LocalDate fecha_Inicio;
    private IncidenteTipo tipo;
}
