package com.bomberoshn.usersAplications.Repository;

import com.bomberoshn.usersAplications.Entitys.Seguridad.ObjetoEntity;
import com.bomberoshn.usersAplications.Utils.enums.ObjetoTipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ObjetoRepository extends JpaRepository<ObjetoEntity, UUID> {

    boolean existsByNombreIgnoreCaseAndTipo(
            String nombre,
            ObjetoTipo tipo
    );

    boolean existsByNombreIgnoreCaseAndTipoAndIdNot(
            String nombre,
            ObjetoTipo tipo,
            UUID id
    );
}