package com.bomberoshn.cceAplications.Services;

import com.bomberoshn.cceAplications.DTO.ArchivoDTO;
import com.bomberoshn.cceAplications.DTO.IncidenteTipoResponseDTO;
import com.bomberoshn.cceAplications.Entitys.Catalogo.IncidenteTipoEntity;
import com.bomberoshn.cceAplications.Repository.Catalogo.IncidenteTipoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public class IncidenteTipoService {

    private final IncidenteTipoRepository repository;
    private final ArchivoService archivoService;

    public IncidenteTipoService(IncidenteTipoRepository repository, ArchivoService archivoService) {
        this.repository = repository;
        this.archivoService = archivoService;
    }

    @Transactional(readOnly = true)
    public List<IncidenteTipoResponseDTO> obtenerTodos() {
        return repository.findAllByOrderByNombreAsc().stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public IncidenteTipoResponseDTO obtenerPorId(UUID id) {
        IncidenteTipoEntity entity = repository.findById(id).orElse(null);
        return entity == null ? null : mapToResponse(entity);
    }

    @Transactional
    public IncidenteTipoResponseDTO crear(String nombre, String indexReporte, MultipartFile imagen) {
        if (nombre == null || nombre.isBlank()) return null;
        if (imagen == null || imagen.isEmpty()) return null;

        String nombreLimpio = nombre.trim().toUpperCase();

        if (repository.existsByNombreIgnoreCase(nombreLimpio)) return null;

        validarImagen(imagen);

        ArchivoDTO archivo = archivoService.subirArchivo(imagen);

        IncidenteTipoEntity entity = new IncidenteTipoEntity();
        entity.setNombre(nombreLimpio);
        entity.setIdImagen(archivo.getId());
        entity.setIndexReporte(limpiarTexto(indexReporte));

        return mapToResponse(repository.save(entity));
    }

    @Transactional
    public IncidenteTipoResponseDTO actualizar(UUID id, String nombre, String indexReporte, MultipartFile imagen) {
        if (id == null || nombre == null || nombre.isBlank()) return null;

        IncidenteTipoEntity entity = repository.findById(id).orElse(null);

        if (entity == null) return null;

        String nombreLimpio = nombre.trim().toUpperCase();

        if (repository.existsByNombreIgnoreCaseAndIdNot(nombreLimpio, id)) return null;

        entity.setNombre(nombreLimpio);
        entity.setIndexReporte(limpiarTexto(indexReporte));

        if (imagen != null && !imagen.isEmpty()) {
            validarImagen(imagen);

            ArchivoDTO archivo = archivoService.subirArchivo(imagen);
            entity.setIdImagen(archivo.getId());
        }

        return mapToResponse(repository.save(entity));
    }

    @Transactional
    public boolean eliminar(UUID id) {
        if (id == null || !repository.existsById(id)) return false;

        repository.deleteById(id);
        return true;
    }

    @Transactional
    public IncidenteTipoEntity obtenerOCrearPorNombre(String nombre) {
        if (nombre == null || nombre.isBlank()) return null;

        String nombreLimpio = nombre.trim().toUpperCase();

        return repository.findByNombreIgnoreCase(nombreLimpio).orElseGet(() -> {
            IncidenteTipoEntity nuevo = new IncidenteTipoEntity();
            nuevo.setNombre(nombreLimpio);
            nuevo.setIdImagen(null);
            nuevo.setIndexReporte(null);
            return repository.save(nuevo);
        });
    }

    private void validarImagen(MultipartFile imagen) {
        String contentType = imagen.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen.");
        }
    }

    private String limpiarTexto(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }

    private IncidenteTipoResponseDTO mapToResponse(
            IncidenteTipoEntity entity
    ) {
        String urlImagen = null;

        if (entity.getIdImagen() != null) {
            ArchivoDTO imagen = archivoService.obtenerArchivo(
                    entity.getIdImagen()
            );

            if (imagen != null) {
                archivoService.agregarUrls(imagen);
                urlImagen = imagen.getUrlVisualizacion();
            }
        }

        return new IncidenteTipoResponseDTO(
                entity.getId(),
                entity.getNombre(),
                urlImagen,
                entity.getIndexReporte()
        );
    }
}