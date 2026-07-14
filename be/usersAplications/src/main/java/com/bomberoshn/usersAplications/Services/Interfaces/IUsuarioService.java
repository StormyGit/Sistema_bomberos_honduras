package com.bomberoshn.usersAplications.Services;

import com.bomberoshn.usersAplications.DTO.UsuarioCreateDTO;
import com.bomberoshn.usersAplications.DTO.UsuarioResponseDTO;
import com.bomberoshn.usersAplications.DTO.UsuarioUpdateDTO;

import java.util.List;
import java.util.UUID;

public interface IUsuarioService {

    List<UsuarioResponseDTO> getAll();

    UsuarioResponseDTO getById(UUID id);

    UsuarioResponseDTO create(
            UsuarioCreateDTO dto
    );

    UsuarioResponseDTO update(
            UUID id,
            UsuarioUpdateDTO dto
    );

    boolean delete(UUID id);
}