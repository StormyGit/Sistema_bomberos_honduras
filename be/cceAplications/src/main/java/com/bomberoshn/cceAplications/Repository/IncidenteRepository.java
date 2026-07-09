package com.bomberoshn.cceAplications.Repository;

import com.bomberoshn.cceAplications.DTO.IncidenteTipoResumenDTO;
import com.bomberoshn.cceAplications.DTO.IncidenteTipoResumenProjection;
import com.bomberoshn.cceAplications.Entitys.IncidenteEntity;
import com.bomberoshn.cceAplications.Entitys.IncidenteEstado;
import com.bomberoshn.cceAplications.Entitys.IncidenteTipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface IncidenteRepository extends JpaRepository<IncidenteEntity, UUID> {

    List<IncidenteEntity> findByFechaCreacionGreaterThanEqualAndFechaCreacionLessThanOrderByFechaCreacionDesc(
            LocalDateTime inicio,
            LocalDateTime fin
    );


    @Query("""
    SELECT i
    FROM IncidenteEntity i
    WHERE (:buscar IS NULL OR :buscar = ''
        OR LOWER(i.departamento) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(i.colonia) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(i.referencia) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(i.direccion) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(i.denuncianteNombre) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(i.denuncianteTelefono) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(i.recepcionNombre) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(i.observacionGeneral) LIKE LOWER(CONCAT('%', :buscar, '%'))
    )
    AND (:tipo IS NULL OR i.incidente = :tipo)
    AND (:isFinalizado = false OR i.estado = :estadoFinalizado)
    AND i.fechaCreacion >= :fechaInicio
    AND i.fechaCreacion < :fechaFinal
    ORDER BY i.fechaCreacion DESC
""")
    List<IncidenteEntity> buscarIncidentes(
            @Param("buscar") String buscar,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFinal") LocalDateTime fechaFinal,
            @Param("tipo") IncidenteTipo tipo,
            @Param("isFinalizado") boolean isFinalizado,
            @Param("estadoFinalizado") IncidenteEstado estadoFinalizado
    );

    @Query("""
    SELECT 
        i.incidente AS tipo,
        COUNT(i.id) AS total
    FROM IncidenteEntity i
    WHERE (:buscar = ''
        OR LOWER(COALESCE(i.departamento, '')) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(COALESCE(i.colonia, '')) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(COALESCE(i.referencia, '')) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(COALESCE(i.direccion, '')) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(COALESCE(i.denuncianteNombre, '')) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(COALESCE(i.denuncianteTelefono, '')) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(COALESCE(i.recepcionNombre, '')) LIKE LOWER(CONCAT('%', :buscar, '%'))
        OR LOWER(COALESCE(i.observacionGeneral, '')) LIKE LOWER(CONCAT('%', :buscar, '%'))
    )
    AND (:filtrarTipo = false OR i.incidente = :tipo)
    AND (:isFinalizado = false OR i.estado = :estadoFinalizado)
    AND i.fechaCreacion >= :fechaInicio
    AND i.fechaCreacion < :fechaFinal
    GROUP BY i.incidente
    ORDER BY COUNT(i.id) DESC
""")
    List<IncidenteTipoResumenProjection> resumenPorTipo(
            @Param("buscar") String buscar,
            @Param("filtrarTipo") Boolean filtrarTipo,
            @Param("tipo") IncidenteTipo tipo,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFinal") LocalDateTime fechaFinal,
            @Param("isFinalizado") boolean isFinalizado,
            @Param("estadoFinalizado") IncidenteEstado estadoFinalizado
    );

}
