package com.bomberoshn.usersAplications.Controller.Seguridad;


import com.bomberoshn.usersAplications.DTO.RolRequestDTO;
import com.bomberoshn.usersAplications.DTO.RolResponseDTO;
import com.bomberoshn.usersAplications.Services.Interfaces.IRolService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/roles")
public class RolController {

    public RolController(IRolService rolService) {
        this.rolService = rolService;
    }

    private final IRolService rolService;

    @GetMapping
    public List<RolResponseDTO> getAll() {
        return rolService.getAll();
    }

    @GetMapping("/{id}")
    public RolResponseDTO getById(
            @PathVariable UUID id
    ) {
        return rolService.getById(id);
    }

    @PostMapping
    public RolResponseDTO create(
            @RequestBody RolRequestDTO dto
    ) {
        return rolService.create(dto);
    }

    @PutMapping("/{id}")
    public RolResponseDTO update(
            @PathVariable UUID id,
            @RequestBody RolRequestDTO dto
    ) {
        return rolService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public boolean delete(
            @PathVariable UUID id
    ) {
        return rolService.delete(id);
    }
}