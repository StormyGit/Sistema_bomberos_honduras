package com.bomberoshn.cceAplications.Repository;

import com.bomberoshn.cceAplications.Entitys.EvidenciasEntity;
import com.bomberoshn.cceAplications.Entitys.IncidenteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EvidenciaRepository extends JpaRepository<EvidenciasEntity, UUID> {
    List<EvidenciasEntity> findByIdIncidenteOrderByFechaCreacionAsc(UUID idIncidente);
}
