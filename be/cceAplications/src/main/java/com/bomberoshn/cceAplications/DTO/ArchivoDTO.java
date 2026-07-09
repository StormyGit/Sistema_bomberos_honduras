package com.bomberoshn.cceAplications.DTO;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArchivoDTO {
    private UUID id;
    private String nombreOriginal;
    private String nombreGuardado;
    private String tipoArchivo;
    private Long peso;
    private String ruta;
    private LocalDateTime fechaCreacion;

    private String urlVisualizacion;
    private String urlDescarga;
}
