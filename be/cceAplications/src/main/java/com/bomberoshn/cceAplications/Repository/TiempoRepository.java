package com.bomberoshn.cceAplications.Repository;

import com.bomberoshn.cceAplications.Entitys.TiempoEntity;
import com.bomberoshn.cceAplications.Entitys.TiempoTipo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TiempoRepository extends JpaRepository<TiempoEntity, UUID> {

    List<TiempoEntity> findByIdIncidente(UUID idIncidente);

    boolean existsByIdIncidenteAndTipoTiempo(UUID idIncidente, TiempoTipo tipoTiempo);

    Optional<TiempoEntity> findByIdIncidenteAndTipoTiempo(UUID idIncidente, TiempoTipo tipoTiempo);
}