package com.bomberoshn.cceAplications.DTO;

import com.bomberoshn.cceAplications.Entitys.IncidenteTipo;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class IncidenteTipoResumenDTO {

    private IncidenteTipo tipo;
    private String nombre;
    private Long total;
}
