package com.bomberoshn.usersAplications.Services;

import com.bomberoshn.usersAplications.DTO.ObjetoRequestDTO;
import com.bomberoshn.usersAplications.DTO.ObjetoResponseDTO;

import java.util.List;
import java.util.UUID;

public interface IObjetoService {

    List<ObjetoResponseDTO> getAll();

    ObjetoResponseDTO getById(UUID id);

    ObjetoResponseDTO create(
            ObjetoRequestDTO dto
    );

    ObjetoResponseDTO update(
            UUID id,
            ObjetoRequestDTO dto
    );

    boolean delete(UUID id);
}