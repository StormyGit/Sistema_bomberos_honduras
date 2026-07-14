package com.bomberoshn.cceAplications.Repository.Catalogo;

import com.bomberoshn.cceAplications.Entitys.Catalogo.EstacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface EstacionRepository extends JpaRepository<EstacionEntity, UUID> {
    @Query("""
        SELECT e
        FROM EstacionEntity e
        JOIN FETCH e.departamento d
        JOIN FETCH e.municipio m
        LEFT JOIN FETCH e.regional r
        WHERE (:departamentoId IS NULL OR d.id = :departamentoId)
          AND (:isCentral IS NULL OR e.central = :isCentral)
        ORDER BY e.central DESC, e.nombre ASC
    """)
    List<EstacionEntity> buscarPorDepartamento(
            @Param("departamentoId") UUID departamentoId,
            @Param("isCentral") Boolean isCentral
    );

    @Query("""
        SELECT e
        FROM EstacionEntity e
        JOIN FETCH e.departamento d
        JOIN FETCH e.municipio m
        LEFT JOIN FETCH e.regional r
        WHERE d.id = :departamentoId
          AND m.id = :municipioId
          AND (:isCentral IS NULL OR e.central = :isCentral)
        ORDER BY e.central DESC, e.nombre ASC
    """)
    List<EstacionEntity> buscarPorDepartamentoYMunicipio(
            @Param("departamentoId") UUID departamentoId,
            @Param("municipioId") UUID municipioId,
            @Param("isCentral") Boolean isCentral
    );
}