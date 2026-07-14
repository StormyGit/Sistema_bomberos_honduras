package com.bomberoshn.usersAplications.Services;

import com.bomberoshn.usersAplications.DTO.CambiarPermisoRequestDTO;
import com.bomberoshn.usersAplications.DTO.ObjetoPermisoResponseDTO;

import java.util.List;
import java.util.UUID;

public interface IPermisosService {

    public boolean cambiarPermiso( CambiarPermisoRequestDTO dto);

    List<ObjetoPermisoResponseDTO> getPermisosPorRol( UUID rolId );

}
