package com.bomberoshn.usersAplications.Controller;

import com.bomberoshn.usersAplications.DTO.ObjetoRequestDTO;
import com.bomberoshn.usersAplications.DTO.ObjetoResponseDTO;
import com.bomberoshn.usersAplications.Services.IObjetoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/objetos")
@RequiredArgsConstructor
public class ObjetoController {

    private final IObjetoService objetoService;

    @GetMapping
    public List<ObjetoResponseDTO> getAll() {
        return objetoService.getAll();
    }

    @GetMapping("/{id}")
    public ObjetoResponseDTO getById(
            @PathVariable UUID id
    ) {
        return objetoService.getById(id);
    }

    @PostMapping
    public ObjetoResponseDTO create(
            @RequestBody ObjetoRequestDTO dto
    ) {
        return objetoService.create(dto);
    }

    @PutMapping("/{id}")
    public ObjetoResponseDTO update(
            @PathVariable UUID id,
            @RequestBody ObjetoRequestDTO dto
    ) {
        return objetoService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public boolean delete(
            @PathVariable UUID id
    ) {
        return objetoService.delete(id);
    }
}