package com.bomberoshn.cceAplications.Controller;

import com.bomberoshn.cceAplications.DTO.ArchivoDTO;
import com.bomberoshn.cceAplications.Entitys.ArchivoEntity;
import com.bomberoshn.cceAplications.Services.ArchivoService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/archivos")
public class ArchivoController {

    private final ArchivoService archivoService;

    public ArchivoController(ArchivoService archivoService) {
        this.archivoService = archivoService;
    }

    @PostMapping("/subir")
    public ResponseEntity<ArchivoDTO> subirArchivo(
            @RequestParam("file") MultipartFile file
    ) {
        ArchivoDTO archivo = archivoService.subirArchivo(file);
        return ResponseEntity.ok(agregarUrls(archivo));
    }

    @GetMapping
    public ResponseEntity<List<ArchivoDTO>> listarArchivos() {
        List<ArchivoDTO> archivos = archivoService.listarArchivos()
                .stream()
                .map(this::agregarUrls)
                .toList();

        return ResponseEntity.ok(archivos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArchivoDTO> obtenerArchivo(@PathVariable UUID id) {
        return ResponseEntity.ok(agregarUrls(archivoService.obtenerArchivo(id)));
    }

    @GetMapping("/descargar/{id}")
    public ResponseEntity<Resource> descargarArchivo(@PathVariable UUID id) {

        ArchivoEntity entity = archivoService.obtenerEntity(id);
        Resource resource = archivoService.descargarArchivo(id);

        String contentType = entity.getTipoArchivo();

        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + entity.getNombreOriginal() + "\""
                )
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarArchivo(@PathVariable UUID id) {
        archivoService.eliminarArchivo(id);
        return ResponseEntity.ok("Archivo eliminado correctamente.");
    }

    @GetMapping("/ver/{id}")
    public ResponseEntity<Resource> verArchivo(@PathVariable UUID id) {

        ArchivoEntity entity = archivoService.obtenerEntity(id);
        Resource resource = archivoService.descargarArchivo(id);

        String contentType = entity.getTipoArchivo();

        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + entity.getNombreOriginal() + "\""
                )
                .body(resource);
    }

    @GetMapping("/incidente/{idIncidente}")
    public ResponseEntity<List<ArchivoDTO>> listarArchivosPorIncidente(
            @PathVariable UUID idIncidente
    ) {
        List<ArchivoDTO> archivos = archivoService.listarArchivosPorIncidente(idIncidente)
                .stream()
                .map(this::agregarUrls)
                .toList();

        return ResponseEntity.ok(archivos);
    }

    private ArchivoDTO agregarUrls(ArchivoDTO archivo) {

        String baseUrl = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .build()
                .toUriString();

        archivo.setUrlVisualizacion(baseUrl + "/archivos/ver/" + archivo.getId());
        archivo.setUrlDescarga(baseUrl + "/archivos/descargar/" + archivo.getId());

        return archivo;
    }
}