package com.bomberoshn.cceAplications.Repository;

import com.bomberoshn.cceAplications.DTO.IncidentesPorMunicipioTipoProjection;
import com.bomberoshn.cceAplications.Entitys.RecursoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface RecursoRepository
        extends JpaRepository<RecursoEntity, UUID> {

    List<RecursoEntity> findByIdIncidente(UUID idIncidente);

    @Query(
            value = """
                SELECT
                    municipio.id AS "municipioId",
                    municipio.nombre AS "municipio",
                    tipo.id AS "tipoId",
                    tipo.nombre AS "tipoNombre",
                    COUNT(DISTINCT incidente.id) AS "total"

                FROM cce_recursos recurso

                INNER JOIN cce_incidente incidente
                    ON incidente.id = recurso.id_incidente

                INNER JOIN catalogo_incidente_tipo tipo
                    ON tipo.id = incidente.incidente_tipo_id

                INNER JOIN catalogo_estacion estacion
                    ON estacion.id = recurso.id_estacion

                INNER JOIN catalogo_municipio municipio
                    ON municipio.id = estacion.municipio_id

                WHERE incidente.fecha_creacion >= :fechaInicio
                  AND incidente.fecha_creacion < :fechaFinal

                  AND (
                      :tipoId IS NULL
                      OR tipo.id = :tipoId
                  )

                  AND (
                      :buscar IS NULL
                      OR :buscar = ''
                      OR LOWER(COALESCE(municipio.nombre, ''))
                          LIKE LOWER(CONCAT('%', :buscar, '%'))
                      OR LOWER(COALESCE(tipo.nombre, ''))
                          LIKE LOWER(CONCAT('%', :buscar, '%'))
                      OR LOWER(COALESCE(incidente.departamento, ''))
                          LIKE LOWER(CONCAT('%', :buscar, '%'))
                      OR LOWER(COALESCE(incidente.colonia, ''))
                          LIKE LOWER(CONCAT('%', :buscar, '%'))
                      OR LOWER(COALESCE(incidente.referencia, ''))
                          LIKE LOWER(CONCAT('%', :buscar, '%'))
                      OR LOWER(COALESCE(incidente.direccion, ''))
                          LIKE LOWER(CONCAT('%', :buscar, '%'))
                  )

                GROUP BY
                    municipio.id,
                    municipio.nombre,
                    tipo.id,
                    tipo.nombre

                ORDER BY
                    municipio.nombre ASC,
                    COUNT(DISTINCT incidente.id) DESC
                """,
            nativeQuery = true
    )
    List<IncidentesPorMunicipioTipoProjection>
    contarIncidentesPorMunicipioYTipo(
            @Param("fechaInicio")
            LocalDateTime fechaInicio,

            @Param("fechaFinal")
            LocalDateTime fechaFinal,

            @Param("tipoId")
            UUID tipoId,

            @Param("buscar")
            String buscar
    );
}