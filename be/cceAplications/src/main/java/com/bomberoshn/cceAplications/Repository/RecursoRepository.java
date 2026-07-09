package com.bomberoshn.cceAplications.Repository;

import com.bomberoshn.cceAplications.DTO.IncidentesPorMunicipioTipoProjection;
import com.bomberoshn.cceAplications.Entitys.RecursoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface RecursoRepository extends JpaRepository<RecursoEntity, UUID> {

    List<RecursoEntity> findByIdIncidente(UUID idIncidente);


    @Query(value = """
        SELECT
            m.id AS "municipioId",
            m.nombre AS "municipio",
            i.incidente AS "incidente",
            COUNT(DISTINCT i.id) AS "total"
        FROM public.cce_recursos r
        INNER JOIN public.catalogo_estacion e
            ON e.id = r.id_estacion
        INNER JOIN public.catalogo_municipio m
            ON m.id = e.municipio_id
        INNER JOIN public.cce_incidente i
            ON i.id = r.id_incidente
        WHERE i.fecha_creacion >= :fechaInicio
          AND i.fecha_creacion < :fechaFinal
          AND (:tipo IS NULL OR i.incidente = CAST(:tipo AS varchar))
          AND (
                :buscar = ''
                OR LOWER(m.nombre) LIKE CONCAT('%', LOWER(:buscar), '%')
                OR LOWER(COALESCE(i.colonia, '')) LIKE CONCAT('%', LOWER(:buscar), '%')
                OR LOWER(COALESCE(i.referencia, '')) LIKE CONCAT('%', LOWER(:buscar), '%')
                OR LOWER(COALESCE(i.direccion, '')) LIKE CONCAT('%', LOWER(:buscar), '%')
                OR LOWER(COALESCE(i.denunciante_nombre, '')) LIKE CONCAT('%', LOWER(:buscar), '%')
          )
        GROUP BY
            m.id,
            m.nombre,
            i.incidente
        ORDER BY
            m.nombre ASC,
            i.incidente ASC
        """, nativeQuery = true)
    List<IncidentesPorMunicipioTipoProjection> contarIncidentesPorMunicipioYTipo(
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFinal") LocalDateTime fechaFinal,
            @Param("tipo") String tipo,
            @Param("buscar") String buscar
    );
}