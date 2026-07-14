package com.bomberoshn.usersAplications.Entitys.Catalogo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "catalogo_departamento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartamentoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 80)
    private String nombre;

    @Min(0)
    @Max(18)
    @Column(nullable = false, unique = true)
    private Byte codigo;

}