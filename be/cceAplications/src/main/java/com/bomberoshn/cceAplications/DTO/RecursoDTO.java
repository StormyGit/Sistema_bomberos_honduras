package com.bomberoshn.cceAplications.DTO;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecursoDTO {

    private UUID id;
    private UUID idIncidente;
    private String estacion;
    private UUID idEstacion;
    private UUID idUnidad;
    private String unidad;
    private String oficialEncargado;
    private Integer numPersonal;
    private BigDecimal galonAgua;
    private String observacion;
    private String point;
}