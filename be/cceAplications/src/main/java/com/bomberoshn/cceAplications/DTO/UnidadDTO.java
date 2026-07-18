package com.bomberoshn.cceAplications.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnidadDTO {

    private UUID id;

    @NotBlank(message = "El nombre de la unidad es obligatorio")
    @Size(
            max = 80,
            message = "El nombre no puede superar los 80 caracteres"
    )
    private String nombre;

    @NotNull(message = "El id de la estación es obligatorio")
    @JsonProperty("id_estacion")
    private UUID idEstacion;

    @Builder.Default
    private boolean disponible = true;
}