package com.bomberoshn.cceAplications.Entitys;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "cce_reportes_incidente",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_reporte_incidente",
                        columnNames = "id_incidente"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteIncidenteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    /*
     * Un incidente solamente puede tener un reporte.
     */
    @Column(
            name = "id_incidente",
            nullable = false,
            unique = true
    )
    private UUID idIncidente;

    /*
     * JSON con las secciones y campos del reporte.
     */
    @Column(
            name = "estructura_form",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String estructuraForm;

    /*
     * JSON con los valores mostrados en el reporte.
     */
    @Column(
            name = "data_form",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String dataForm;

    @Column(
            name = "fecha_creacion",
            nullable = false,
            updatable = false
    )
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    public void prePersist() {
        LocalDateTime ahora = LocalDateTime.now();

        this.fechaCreacion = ahora;
        this.fechaActualizacion = ahora;
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}