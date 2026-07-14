package com.bomberoshn.usersAplications.Repository;

import com.bomberoshn.usersAplications.Entitys.RolEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RolRepository extends JpaRepository<RolEntity, UUID> {
    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

}
