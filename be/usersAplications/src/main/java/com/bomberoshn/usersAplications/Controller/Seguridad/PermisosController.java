package com.bomberoshn.usersAplications.Controller;

import com.bomberoshn.usersAplications.DTO.CambiarPermisoRequestDTO;
import com.bomberoshn.usersAplications.DTO.ObjetoPermisoResponseDTO;
import com.bomberoshn.usersAplications.Services.IPermisosService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/permisos")
@RequiredArgsConstructor
public class PermisosController {

    private final IPermisosService permisosService;

    /*
     * Devuelve todos los objetos con sus acciones
     * y señala cuáles permisos tiene el rol.
     */
    @GetMapping("/rol/{rolId}")
    public List<ObjetoPermisoResponseDTO> getPermisosPorRol(
            @PathVariable UUID rolId
    ) {
        return permisosService.getPermisosPorRol(rolId);
    }

    /*
     * Marca o desmarca un permiso.
     */
    @PostMapping("/cambiar")
    public boolean cambiarPermiso(
            @RequestBody CambiarPermisoRequestDTO dto
    ) {
        return permisosService.cambiarPermiso(dto);
    }
}