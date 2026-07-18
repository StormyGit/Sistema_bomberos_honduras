package com.bomberoshn.cceAplications.Controller;

import com.bomberoshn.cceAplications.DTO.UnidadDTO;
import com.bomberoshn.cceAplications.Entitys.Catalogo.UnidadEntity;
import com.bomberoshn.cceAplications.Services.Catalogo.IUnidadService;
import com.bomberoshn.cceAplications.Services.Catalogo.UnidadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/unidades")
@RequiredArgsConstructor
public class UnidadController {

    private final IUnidadService unidadService;

    @GetMapping("/estacion/{estacionId}")
    public ResponseEntity<List<UnidadDTO>> getByEstacion(
            @PathVariable UUID estacionId,
            @RequestParam(required = false) Boolean isAvailable
    ) {
        return ResponseEntity.ok(
                unidadService.getByEstacion(
                        estacionId,
                        isAvailable
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnidadDTO> getById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                unidadService.getById(id)
        );
    }

    @PostMapping
    public ResponseEntity<UnidadDTO> create(
            @Valid @RequestBody UnidadDTO unidadDTO
    ) {
        UnidadDTO unidadCreada =
                unidadService.create(unidadDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(unidadCreada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnidadDTO> update(
            @PathVariable UUID id,
            @Valid @RequestBody UnidadDTO unidadDTO
    ) {
        return ResponseEntity.ok(
                unidadService.update(
                        id,
                        unidadDTO
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id
    ) {
        unidadService.delete(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}