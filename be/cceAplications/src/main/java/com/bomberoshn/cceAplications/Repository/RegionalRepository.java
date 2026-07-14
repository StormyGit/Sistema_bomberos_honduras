package com.bomberoshn.cceAplications.Repository;

import com.bomberoshn.cceAplications.Entitys.Catalogo.RegionalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RegionalRepository
        extends JpaRepository<RegionalEntity, UUID> {
}