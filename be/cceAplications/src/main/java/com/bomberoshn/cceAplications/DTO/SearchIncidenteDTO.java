package com.bomberoshn.cceAplications.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class SearchIncidenteDTO {

    private String buscar;

    private LocalDate fecha_Inicio;

    private LocalDate fecha_Final;

    private UUID tipoId;

    private Boolean finalizado;
}