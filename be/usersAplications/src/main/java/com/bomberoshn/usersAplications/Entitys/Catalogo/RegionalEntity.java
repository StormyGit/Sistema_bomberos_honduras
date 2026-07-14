package com.bomberoshn.usersAplications.Entitys.Catalogo;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "catalogo_regional")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegionalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 80)
    private String nombre;
}