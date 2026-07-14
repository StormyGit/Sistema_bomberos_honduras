package com.bomberoshn.cceAplications.DTO;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidenteTipoResumenDTO {

    private UUID tipoId;

    private String nombre;

    private Long total;
}