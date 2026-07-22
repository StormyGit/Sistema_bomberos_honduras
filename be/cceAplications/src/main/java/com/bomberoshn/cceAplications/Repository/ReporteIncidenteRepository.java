package com.bomberoshn.cceAplications.Repository;

import com.bomberoshn.cceAplications.Entitys.Catalogo.RegionalEntity;
import com.bomberoshn.cceAplications.Entitys.ReporteIncidenteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ReporteIncidenteRepository extends JpaRepository<ReporteIncidenteEntity, UUID> {
    Optional<ReporteIncidenteEntity> findByIdIncidente(
            UUID idIncidente
    );
}