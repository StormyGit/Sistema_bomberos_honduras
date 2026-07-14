package com.bomberoshn.cceAplications.Entitys.Catalogo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "catalogo_incidente_tipo",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_incidente_tipo_nombre",
                        columnNames = "nombre"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class IncidenteTipoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 80, unique = true)
    private String nombre;
}