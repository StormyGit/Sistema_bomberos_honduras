package com.bomberoshn.cceAplications.DTO;

import com.bomberoshn.cceAplications.Entitys.TiempoTipo;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TiempoDTO {

    private UUID id;
    private UUID idIncidente;
    private TiempoTipo tipoTiempo;
    private LocalDateTime horaCreacion;
    private LocalDateTime fechaCreacion;
    private String observacion;
}