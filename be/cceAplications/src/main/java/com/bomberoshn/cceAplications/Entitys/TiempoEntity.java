package com.bomberoshn.cceAplications.Entitys;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "cce_tiempo",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_tiempo_incidente_tipo",
                        columnNames = {"id_incidente", "tipo_tiempo"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TiempoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "id_incidente", nullable = false)
    private UUID idIncidente;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_tiempo", nullable = false)
    private TiempoTipo tipoTiempo;

    @Column(name = "hora_creacion")
    private LocalDateTime horaCreacion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "observacion")
    private String observacion;
}