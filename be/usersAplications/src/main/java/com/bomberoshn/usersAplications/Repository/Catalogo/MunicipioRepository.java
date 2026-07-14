package com.bomberoshn.usersAplications.Repository.Catalogo;

import com.bomberoshn.usersAplications.Entitys.Catalogo.MunicipioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MunicipioRepository extends JpaRepository<MunicipioEntity, UUID> {
    List<MunicipioEntity> findByDepartamentoIdOrderByCodigoAsc(UUID departamentoId);
}