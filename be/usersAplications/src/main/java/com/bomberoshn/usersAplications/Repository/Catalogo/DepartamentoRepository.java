package com.bomberoshn.usersAplications.Repository.Catalogo;

import com.bomberoshn.usersAplications.Entitys.Catalogo.DepartamentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DepartamentoRepository extends JpaRepository<DepartamentoEntity, UUID> {
    List<DepartamentoEntity> findAllByOrderByCodigoAsc();
}