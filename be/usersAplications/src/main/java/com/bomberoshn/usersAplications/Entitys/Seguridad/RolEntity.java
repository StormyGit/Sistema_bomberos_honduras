package com.bomberoshn.usersAplications.Entitys.Seguridad;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "segur_rol"
)
@Getter
@Setter
@NoArgsConstructor
public class RolEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            nullable = false,
            unique = true,
            length = 100
    )
    private String codigo;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;
}
