package com.bomberoshn.cceAplications.Services.Catalogo;

import com.bomberoshn.cceAplications.DTO.UnidadDTO;
import com.bomberoshn.cceAplications.Entitys.Catalogo.UnidadEntity;

import java.util.List;
import java.util.UUID;

public interface IUnidadService {

    List<UnidadDTO> getByEstacion(
            UUID estacionId,
            Boolean isAvailable
    );

    UnidadDTO getById(UUID id);

    UnidadDTO create(UnidadDTO unidadDTO);

    UnidadDTO update(
            UUID id,
            UnidadDTO unidadDTO
    );
    UnidadDTO toggleDisponible(
            UUID id,
            Boolean disponible
    );
    void delete(UUID id);
}