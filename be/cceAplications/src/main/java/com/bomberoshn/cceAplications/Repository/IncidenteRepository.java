package com.bomberoshn.cceAplications.Repository;

import com.bomberoshn.cceAplications.Entitys.IncidenteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface IncidenteRepository extends JpaRepository<IncidenteEntity, UUID> {
}
