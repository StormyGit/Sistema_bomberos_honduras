package com.bomberoshn.usersAplications.Entitys;


import com.bomberoshn.usersAplications.Entitys.Catalogo.DepartamentoEntity;
import com.bomberoshn.usersAplications.Entitys.Catalogo.EstacionEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        name = "segur_usuarios",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_usuario_correo_codigo",
                        columnNames = "correo_codigo"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            nullable = false,
            length = 100
    )
    private String nombre;

    @Column(
            nullable = false,
            length = 100
    )
    private String apellido;

    @Column(
            name = "correo_codigo",
            nullable = false,
            unique = true
    )
    private String correoCodigo;

    @Column(nullable = false)
    private String password;

    /*
     * Departamento o región a la que pertenece el usuario.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "departamento_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_usuario_departamento"
            )
    )
    private DepartamentoEntity departamento;

    /*
     * La estación puede ser opcional, por ejemplo,
     * para usuarios administrativos regionales.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "estacion_id",
            foreignKey = @ForeignKey(
                    name = "fk_usuario_estacion"
            )
    )
    private EstacionEntity estacion;

    /*
     * Tipo de empleado:
     * BOMBERO, ADMINISTRATIVO, etc.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private UsuarioTipo tipo;

    /*
     * Rol de seguridad:
     * ADMIN, OPERADOR, SUPERVISOR, etc.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "rol_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_usuario_rol"
            )
    )
    private RolEntity rol;
}