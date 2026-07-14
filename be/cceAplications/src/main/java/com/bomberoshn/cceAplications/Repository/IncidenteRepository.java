package com.bomberoshn.cceAplications.Repository;

import com.bomberoshn.cceAplications.DTO.IncidenteTipoResumenProjection;
import com.bomberoshn.cceAplications.Entitys.IncidenteEntity;
import com.bomberoshn.cceAplications.Entitys.IncidenteEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface IncidenteRepository
        extends JpaRepository<IncidenteEntity, UUID> {

    List<IncidenteEntity>
    findByFechaCreacionGreaterThanEqualAndFechaCreacionLessThanOrderByFechaCreacionDesc(
            LocalDateTime inicio,
            LocalDateTime fin
    );

    /*
     * Busca incidentes aplicando filtros opcionales.
     *
     * tipoId:
     *   null = todos los tipos
     *
     * finalizado:
     *   null  = todos los estados
     *   true  = solamente finalizados
     *   false = solamente no finalizados
     */
    @Query("""
        SELECT i
        FROM IncidenteEntity i
        JOIN i.incidenteTipo tipo
        WHERE (
            :buscar IS NULL
            OR :buscar = ''
            OR LOWER(COALESCE(tipo.nombre, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.departamento, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.colonia, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.referencia, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.direccion, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.denuncianteNombre, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.denuncianteTelefono, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.recepcionNombre, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.observacionGeneral, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
        )
        AND (
            :tipoId IS NULL
            OR tipo.id = :tipoId
        )
        AND (
            :finalizado IS NULL
            OR (
                :finalizado = TRUE
                AND i.estado = :estadoFinalizado
            )
            OR (
                :finalizado = FALSE
                AND i.estado <> :estadoFinalizado
            )
        )
        AND i.fechaCreacion >= :fechaInicio
        AND i.fechaCreacion < :fechaFinal
        ORDER BY i.fechaCreacion DESC
        """)
    List<IncidenteEntity> buscarIncidentes(
            @Param("buscar")
            String buscar,

            @Param("fechaInicio")
            LocalDateTime fechaInicio,

            @Param("fechaFinal")
            LocalDateTime fechaFinal,

            @Param("tipoId")
            UUID tipoId,

            @Param("finalizado")
            Boolean finalizado,

            @Param("estadoFinalizado")
            IncidenteEstado estadoFinalizado
    );

    /*
     * Cuenta los incidentes agrupados por el catálogo
     * de tipos de incidente.
     */
    @Query("""
        SELECT
            tipo.id AS tipoId,
            tipo.nombre AS tipoNombre,
            COUNT(i.id) AS total
        FROM IncidenteEntity i
        JOIN i.incidenteTipo tipo
        WHERE (
            :buscar IS NULL
            OR :buscar = ''
            OR LOWER(COALESCE(tipo.nombre, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.departamento, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.colonia, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.referencia, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.direccion, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.denuncianteNombre, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.denuncianteTelefono, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.recepcionNombre, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR LOWER(COALESCE(i.observacionGeneral, ''))
                LIKE LOWER(CONCAT('%', :buscar, '%'))
        )
        AND (
            :tipoId IS NULL
            OR tipo.id = :tipoId
        )
        AND (
            :finalizado IS NULL
            OR (
                :finalizado = TRUE
                AND i.estado = :estadoFinalizado
            )
            OR (
                :finalizado = FALSE
                AND i.estado <> :estadoFinalizado
            )
        )
        AND i.fechaCreacion >= :fechaInicio
        AND i.fechaCreacion < :fechaFinal
        GROUP BY tipo.id, tipo.nombre
        ORDER BY COUNT(i.id) DESC
        """)
    List<IncidenteTipoResumenProjection> resumenPorTipo(
            @Param("buscar")
            String buscar,

            @Param("tipoId")
            UUID tipoId,

            @Param("fechaInicio")
            LocalDateTime fechaInicio,

            @Param("fechaFinal")
            LocalDateTime fechaFinal,

            @Param("finalizado")
            Boolean finalizado,

            @Param("estadoFinalizado")
            IncidenteEstado estadoFinalizado
    );
}