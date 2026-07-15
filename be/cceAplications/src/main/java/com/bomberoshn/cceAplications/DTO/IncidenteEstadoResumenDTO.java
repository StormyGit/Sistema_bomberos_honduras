package com.bomberoshn.cceAplications.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidenteEstadoResumenDTO {

    private Long finalizados;

    private Long enEjecucion;

    private Long falsasAlarmas;
}