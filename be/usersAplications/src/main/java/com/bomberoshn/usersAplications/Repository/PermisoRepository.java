package com.bomberoshn.usersAplications.Repository;

import com.bomberoshn.usersAplications.Entitys.AccionTipo;
import com.bomberoshn.usersAplications.Entitys.PermisoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PermisoRepository
        extends JpaRepository<PermisoEntity, UUID> {

    boolean existsByRolIdAndObjetoIdAndAccion(
            UUID rolId,
            UUID objetoId,
            AccionTipo accion
    );

    void deleteByRolIdAndObjetoIdAndAccion(
            UUID rolId,
            UUID objetoId,
            AccionTipo accion
    );

    List<PermisoEntity> findAllByRolId(
            UUID rolId
    );


    List<PermisoEntity> findAllByRol_Id(
            UUID rolId
    );

    boolean existsByRol_IdAndObjeto_IdAndAccion(
            UUID rolId,
            UUID objetoId,
            AccionTipo accion
    );

    void deleteByRol_IdAndObjeto_IdAndAccion(
            UUID rolId,
            UUID objetoId,
            AccionTipo accion
    );
}