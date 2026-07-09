package com.bomberoshn.cceAplications.Entitys;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "archivos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArchivoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nombreOriginal;

    @Column(nullable = false)
    private String nombreGuardado;

    private String tipoArchivo;

    private Long peso;

    @Column(nullable = false)
    private String ruta;

    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
    }

}