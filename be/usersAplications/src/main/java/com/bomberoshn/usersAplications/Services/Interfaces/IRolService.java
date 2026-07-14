package com.bomberoshn.usersAplications.Services;

import com.bomberoshn.usersAplications.DTO.RolRequestDTO;
import com.bomberoshn.usersAplications.DTO.RolResponseDTO;

import java.util.List;
import java.util.UUID;

public interface IRolService {
    List<RolResponseDTO> getAll();

    RolResponseDTO getById(UUID id);

    RolResponseDTO create(RolRequestDTO dto);

    RolResponseDTO update(UUID id, RolRequestDTO dto);

    boolean delete(UUID id);
}
