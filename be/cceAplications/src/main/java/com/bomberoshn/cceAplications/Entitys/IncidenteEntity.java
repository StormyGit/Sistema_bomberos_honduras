package com.bomberoshn.cceAplications.Entitys;

import com.bomberoshn.cceAplications.Entitys.Catalogo.IncidenteTipoEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cce_incidente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidenteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "incidente_tipo_id", nullable = false)
    private IncidenteTipoEntity incidenteTipo;

    @Column(name = "id_parent")
    private UUID idParent;

    @Column(name = "estado")
    private IncidenteEstado estado;

    @Column(length = 100)
    private String departamento;

    @Column(length = 150)
    private String colonia;

    @Column(length = 255)
    private String referencia;

    @Column(length = 255)
    private String direccion;

    @Column(name = "is_anonimo")
    private Boolean isAnonimo;

    @Column(name = "denunciante_nombre", length = 150)
    private String denuncianteNombre;

    @Column(name = "denunciante_telefono", length = 30)
    private String denuncianteTelefono;

    @Column(name = "recepcion_fecha")
    private LocalDate recepcionFecha;

    @Column(name = "recepcion_nombre", length = 150)
    private String recepcionNombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "recepcion_tipo", length = 50)
    private IncidenteRecepcion recepcionTipo;

    @Column(name = "point", columnDefinition = "TEXT")
    private String point;

    @Column(name = "is_falsa_alarma")
    private Boolean isFalsaAlarma;

    @Column(name = "observacion_general", columnDefinition = "TEXT")
    private String observacionGeneral;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}