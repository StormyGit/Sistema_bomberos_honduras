package com.bomberoshn.cceAplications.Controller;

import com.bomberoshn.cceAplications.DTO.IncidenteTipoRequestDTO;
import com.bomberoshn.cceAplications.DTO.IncidenteTipoResponseDTO;
import com.bomberoshn.cceAplications.Services.IncidenteTipoService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/catalogos/incidente-tipos")
public class IncidenteTipoController {

    private final IncidenteTipoService service;

    public IncidenteTipoController(IncidenteTipoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<IncidenteTipoResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(service.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidenteTipoResponseDTO> obtenerPorId(@PathVariable UUID id) {
        IncidenteTipoResponseDTO response = service.obtenerPorId(id);
        return response == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(response);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IncidenteTipoResponseDTO> crear(@RequestParam String nombre, @RequestParam(required = false) String indexReporte, @RequestParam MultipartFile imagen) {
        IncidenteTipoResponseDTO response = service.crear(nombre, indexReporte, imagen);
        return response == null ? ResponseEntity.badRequest().build() : ResponseEntity.ok(response);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IncidenteTipoResponseDTO> actualizar(@PathVariable UUID id, @RequestParam String nombre, @RequestParam(required = false) String indexReporte, @RequestParam(required = false) MultipartFile imagen) {
        IncidenteTipoResponseDTO response = service.actualizar(id, nombre, indexReporte, imagen);
        return response == null ? ResponseEntity.badRequest().build() : ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        return service.eliminar(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}