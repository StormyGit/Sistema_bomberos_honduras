package com.bomberoshn.cceAplications.Repository;


import com.bomberoshn.cceAplications.Entitys.ArchivoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ArchivoRepository extends JpaRepository<ArchivoEntity, UUID> {
}