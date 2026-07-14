package com.bomberoshn.usersAplications.Repository;

import com.bomberoshn.usersAplications.Entitys.Seguridad.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<UsuarioEntity, UUID> {
    Optional<UsuarioEntity> findByCorreoCodigoIgnoreCase(
            String correoCodigo
    );

    boolean existsByCorreoCodigoIgnoreCase(
            String correoCodigo
    );

    boolean existsByCorreoCodigoIgnoreCaseAndIdNot(
            String correoCodigo,
            UUID id
    );
}
