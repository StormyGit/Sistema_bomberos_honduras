package com.bomberoshn.usersAplications.Entitys;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "segur_permiso",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_permiso_rol_objeto_accion",
                        columnNames = {
                                "rol_id",
                                "objeto_id",
                                "accion"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PermisoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "rol_id",
            nullable = false
    )
    private RolEntity rol;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "objeto_id",
            nullable = false
    )
    private ObjetoEntity objeto;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "accion",
            nullable = false,
            length = 20
    )
    private AccionTipo accion;
}