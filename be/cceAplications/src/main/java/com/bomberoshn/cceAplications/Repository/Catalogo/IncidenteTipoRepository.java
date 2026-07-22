package com.bomberoshn.cceAplications.Repository.Catalogo;

import com.bomberoshn.cceAplications.Entitys.Catalogo.IncidenteTipoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IncidenteTipoRepository
        extends JpaRepository<IncidenteTipoEntity, UUID> {

    Optional<IncidenteTipoEntity> findByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCase(String nombre);

    List<IncidenteTipoEntity> findByNombreContainingIgnoreCaseOrderByNombreAsc(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, UUID id);

    List<IncidenteTipoEntity> findAllByOrderByNombreAsc();
}