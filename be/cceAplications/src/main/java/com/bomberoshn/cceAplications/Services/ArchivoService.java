package com.bomberoshn.cceAplications.Services;

import com.bomberoshn.cceAplications.DTO.ArchivoDTO;
import com.bomberoshn.cceAplications.Entitys.ArchivoEntity;
import com.bomberoshn.cceAplications.Entitys.EvidenciasEntity;
import com.bomberoshn.cceAplications.Entitys.IncidenteEntity;
import com.bomberoshn.cceAplications.Repository.ArchivoRepository;


import com.bomberoshn.cceAplications.Repository.EvidenciaRepository;
import com.bomberoshn.cceAplications.Repository.IncidenteRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ArchivoService {

    private final ArchivoRepository archivoRepository;
    private final EvidenciaRepository evidenciaRepository;
    private final Path rootPath;

    public ArchivoService(
            ArchivoRepository archivoRepository,
            IncidenteRepository incidenteRepository,
            EvidenciaRepository evidenciaRepository
    ) {
        this.archivoRepository = archivoRepository;
        this.evidenciaRepository = evidenciaRepository;

        this.rootPath = Paths.get("C:", "bomberos-uploads")
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.rootPath);
        } catch (Exception e) {
            throw new RuntimeException(
                    "No se pudo crear la carpeta de archivos en: " + this.rootPath,
                    e
            );
        }
    }

    public ArchivoDTO subirArchivo(MultipartFile file) {

        long inicio = System.currentTimeMillis();

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("El archivo es obligatorio.");
        }

        String nombreOriginal = file.getOriginalFilename();

        if (nombreOriginal == null || nombreOriginal.isBlank()) {
            throw new RuntimeException("El archivo no tiene un nombre válido.");
        }

        String extension = obtenerExtension(nombreOriginal);
        String nombreGuardado = UUID.randomUUID() + extension;

        try {
            Path destino = this.rootPath.resolve(nombreGuardado).normalize();

            if (!destino.startsWith(this.rootPath)) {
                throw new RuntimeException("Ruta de archivo no permitida.");
            }

            long antesCopy = System.currentTimeMillis();
            Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
            long despuesCopy = System.currentTimeMillis();
            System.out.println("⏱ Files.copy tardó: " + (despuesCopy - antesCopy) + "ms");

            ArchivoEntity entity = new ArchivoEntity();
            entity.setNombreOriginal(nombreOriginal);
            entity.setNombreGuardado(nombreGuardado);
            entity.setTipoArchivo(file.getContentType());
            entity.setPeso(file.getSize());
            entity.setRuta(destino.toString());

            long antesSave = System.currentTimeMillis();
            ArchivoEntity guardado = archivoRepository.save(entity);
            long despuesSave = System.currentTimeMillis();
            System.out.println("⏱ archivoRepository.save tardó: " + (despuesSave - antesSave) + "ms");

            System.out.println("⏱ subirArchivo TOTAL: " + (despuesSave - inicio) + "ms");

            return toDTO(guardado);

        } catch (Exception e) {
            throw new RuntimeException("Error al guardar el archivo.", e);
        }
    }

    public List<ArchivoDTO> listarArchivos() {
        return archivoRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }


    public List<ArchivoDTO> listarArchivosPorIncidente(UUID idIncidente) {

        if (idIncidente == null) {
            throw new RuntimeException("El ID del incidente es obligatorio.");
        }

        List<EvidenciasEntity> evidencias = evidenciaRepository
                .findByIdIncidenteOrderByFechaCreacionAsc(idIncidente);

        if (evidencias.isEmpty()) {
            return List.of();
        }

        List<UUID> idsArchivos = evidencias.stream()
                .map(EvidenciasEntity::getIdArchivo)
                .toList();

        List<ArchivoEntity> archivos = archivoRepository.findAllById(idsArchivos);

        Map<UUID, ArchivoEntity> archivosMap = archivos.stream()
                .collect(Collectors.toMap(
                        ArchivoEntity::getId,
                        archivo -> archivo
                ));

        return evidencias.stream()
                .map(evidencia -> archivosMap.get(evidencia.getIdArchivo()))
                .filter(Objects::nonNull)
                .map(this::toDTO)
                .map(this::agregarUrls)
                .toList();
    }

    public ArchivoDTO obtenerArchivo(UUID id) {
        ArchivoEntity entity = archivoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El archivo no existe."));

        return toDTO(entity);
    }

    public Resource descargarArchivo(UUID id) {
        ArchivoEntity entity = archivoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El archivo no existe."));

        try {
            Path path = Paths.get(entity.getRuta()).toAbsolutePath().normalize();
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("No se puede leer el archivo.");
            }

            return resource;

        } catch (MalformedURLException e) {
            throw new RuntimeException("Ruta del archivo inválida.", e);
        }
    }

    public ArchivoEntity obtenerEntity(UUID id) {
        return archivoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El archivo no existe."));
    }

    public void eliminarArchivo(UUID id) {
        ArchivoEntity entity = archivoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El archivo no existe."));

        try {
            Path path = Paths.get(entity.getRuta()).toAbsolutePath().normalize();
            Files.deleteIfExists(path);
            archivoRepository.delete(entity);

        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar el archivo.", e);
        }
    }

    private String obtenerExtension(String nombreArchivo) {
        int index = nombreArchivo.lastIndexOf(".");
        if (index == -1) {
            return "";
        }
        return nombreArchivo.substring(index);
    }
    public ArchivoDTO agregarUrls(ArchivoDTO archivo) {

        String baseUrl = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .build()
                .toUriString();

        archivo.setUrlVisualizacion(baseUrl + "/archivos/ver/" + archivo.getId());
        archivo.setUrlDescarga(baseUrl + "/archivos/descargar/" + archivo.getId());

        return archivo;
    }
    private ArchivoDTO toDTO(ArchivoEntity entity) {

        ArchivoDTO dto = new ArchivoDTO();

        dto.setId(entity.getId());
        dto.setNombreOriginal(entity.getNombreOriginal());
        dto.setNombreGuardado(entity.getNombreGuardado());
        dto.setTipoArchivo(entity.getTipoArchivo());
        dto.setPeso(entity.getPeso());
        dto.setRuta(entity.getRuta());
        dto.setFechaCreacion(entity.getFechaCreacion());

        return dto;
    }
}