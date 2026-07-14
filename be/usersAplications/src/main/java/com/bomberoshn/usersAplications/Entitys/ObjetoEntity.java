package com.bomberoshn.usersAplications.Entitys;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "segur_objeto",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_objeto_nombre_tipo",
                        columnNames = {
                                "nombre",
                                "tipo"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class ObjetoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            nullable = false,
            length = 100
    )
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private ObjetoTipo tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "objeto_padre_id")
    private ObjetoEntity padre;
}
