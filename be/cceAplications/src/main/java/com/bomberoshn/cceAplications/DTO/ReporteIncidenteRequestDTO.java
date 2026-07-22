package com.bomberoshn.cceAplications.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ReporteIncidenteRequestDTO {

    private UUID idIncidente;

    private String estructuraForm;

    private String dataForm;
}