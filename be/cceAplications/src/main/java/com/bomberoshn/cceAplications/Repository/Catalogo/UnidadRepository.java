package com.bomberoshn.cceAplications.Repository.Catalogo;

import com.bomberoshn.cceAplications.Entitys.Catalogo.UnidadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UnidadRepository extends JpaRepository<UnidadEntity, UUID> {

    @Query("""
        SELECT u
        FROM UnidadEntity u
        WHERE u.estacion.id = :estacionId
          AND (:isAvailable IS NULL OR u.isAvailable = :isAvailable)
        ORDER BY u.nombre ASC
    """)
    List<UnidadEntity> findByEstacionIdAndAvailability(
            @Param("estacionId") UUID estacionId,
            @Param("isAvailable") Boolean isAvailable
    );
}