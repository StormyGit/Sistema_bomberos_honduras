package com.bomberoshn.usersAplications.Controller;


import com.bomberoshn.usersAplications.DTO.UsuarioCreateDTO;
import com.bomberoshn.usersAplications.DTO.UsuarioResponseDTO;
import com.bomberoshn.usersAplications.DTO.UsuarioUpdateDTO;
import com.bomberoshn.usersAplications.Services.IUsuarioService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final IUsuarioService usuarioService;

    @GetMapping
    public List<UsuarioResponseDTO> getAll() {
        return usuarioService.getAll();
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO getById(
            @PathVariable UUID id
    ) {
        return usuarioService.getById(id);
    }

    @PostMapping
    public UsuarioResponseDTO create(
            @RequestBody UsuarioCreateDTO dto
    ) {
        return usuarioService.create(dto);
    }

    @PutMapping("/{id}")
    public UsuarioResponseDTO update(
            @PathVariable UUID id,
            @RequestBody UsuarioUpdateDTO dto
    ) {
        return usuarioService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public boolean delete(
            @PathVariable UUID id
    ) {
        return usuarioService.delete(id);
    }
}