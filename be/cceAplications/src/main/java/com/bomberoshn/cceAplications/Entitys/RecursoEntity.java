package com.bomberoshn.cceAplications.Entitys;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "cce_recursos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecursoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "id_incidente", nullable = false)
    private UUID idIncidente;

    @Column(name = "id_estacion")
    private UUID idEstacion;

    @Column(name = "unidad")
    private String unidad;

    @Column(name = "oficial_encargado")
    private String oficialEncargado;

    @Column(name = "num_personal")
    private Integer numPersonal;

    @Column(name = "galon_agua")
    private BigDecimal galonAgua;

    @Column(name = "observacion")
    private String observacion;
}