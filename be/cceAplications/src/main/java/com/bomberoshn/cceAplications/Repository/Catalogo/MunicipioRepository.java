package com.bomberoshn.cceAplications.Repository.Catalogo;

import com.bomberoshn.cceAplications.Entitys.Catalogo.MunicipioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MunicipioRepository extends JpaRepository<MunicipioEntity, UUID> {
    List<MunicipioEntity> findByDepartamentoIdOrderByCodigoAsc(UUID departamentoId);
}