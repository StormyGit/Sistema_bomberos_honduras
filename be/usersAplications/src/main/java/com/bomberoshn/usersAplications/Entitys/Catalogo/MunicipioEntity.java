package com.bomberoshn.usersAplications.Entitys.Catalogo;

import com.bomberoshn.usersAplications.Entitys.Catalogo.DepartamentoEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "catalogo_municipio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MunicipioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 80)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id", nullable = false)
    private DepartamentoEntity departamento;

    @Column(nullable = false, unique = true)
    private Short codigo;
}