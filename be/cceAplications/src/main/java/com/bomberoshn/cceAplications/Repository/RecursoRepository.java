package com.bomberoshn.cceAplications.Repository;

import com.bomberoshn.cceAplications.Entitys.RecursoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RecursoRepository extends JpaRepository<RecursoEntity, UUID> {

    List<RecursoEntity> findByIdIncidente(UUID idIncidente);
}