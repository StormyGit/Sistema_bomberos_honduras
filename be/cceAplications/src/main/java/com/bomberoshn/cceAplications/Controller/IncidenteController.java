package com.bomberoshn.cceAplications.Controller;

import com.bomberoshn.cceAplications.DTO.*;
import com.bomberoshn.cceAplications.Entitys.TiempoTipo;
import com.bomberoshn.cceAplications.Services.ArchivoService;
import com.bomberoshn.cceAplications.Services.IIncidenteService;
import com.bomberoshn.cceAplications.Services.IncidenteServices;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("incidente")
public class IncidenteController {
    private static final Logger logger = LoggerFactory.getLogger(IncidenteServices.class);

    private final IIncidenteService incidenteSrv;
    private final ArchivoService archivoService;

    public IncidenteController(IIncidenteService incidenteSrv, ArchivoService archivoService) {
        this.incidenteSrv = incidenteSrv;
        this.archivoService = archivoService;
    }

    @GetMapping
    public List<IncidenteDTO> getAll() {
        logger.info("CONTROLLER: Obtener todos los datos");
        return incidenteSrv.getAll();
    }
    @GetMapping("/{id}")
    public IncidenteDTO getById(@PathVariable UUID id) {
        logger.info("CONTROLLER: Obtener un dato");
        return incidenteSrv.getById(id);
    }
    @PostMapping
    public IncidenteDTO create(@RequestBody IncidenteDTO dto){
        logger.info("CONTROLLER: crear un dato");
        return incidenteSrv.create(dto);
    }
    @PutMapping("/{id}")
    public IncidenteDTO update(@PathVariable UUID id, @RequestBody IncidenteDTO dto){
        logger.info("CONTROLLER: Modificar un dato");
        return incidenteSrv.update(id, dto);
    }

    @PostMapping("/{id_incidente}/recurso")
    public RecursoDTO addRecurso(@PathVariable UUID id_incidente, @RequestBody RecursoDTO dto){
        logger.info("CONTROLLER: crear un recurso");
        return incidenteSrv.addRecurso(id_incidente, dto);
    }

    @PostMapping("/{idIncidente}/tiempos/{tipoTiempo}")
    public TiempoDTO addTimer(
            @PathVariable UUID idIncidente,
            @PathVariable TiempoTipo tipoTiempo
    ) {
        logger.info("CONTROLLER: crear un tiempo");
        return incidenteSrv.addTimer(idIncidente, tipoTiempo);
    }

    @GetMapping("/{idIncidente}/tiempos/{tipoTiempo}")
    public ResponseEntity<TiempoDTO> getTimer(
            @PathVariable UUID idIncidente,
            @PathVariable TiempoTipo tipoTiempo
    ) {
        logger.info("CONTROLLER: Obtener tiempos");
        System.out.println(idIncidente);
        System.out.println(tipoTiempo);
        TiempoDTO dto = incidenteSrv.getTimer(idIncidente, tipoTiempo);

        if (dto == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(dto);
    }


    private void logFile(String nombre, MultipartFile file) {
        if (file == null) {
            logger.info("{} = null", nombre);
            return;
        }

        logger.info("{} -> name: {}, size: {}, type: {}, empty: {}",
                nombre,
                file.getOriginalFilename(),
                file.getSize(),
                file.getContentType(),
                file.isEmpty());
    }

    @PostMapping(value = "evidencia", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void addEvidencia(@ModelAttribute EvidenciaDTO evi) {
        long inicioTotal = System.currentTimeMillis();
        logger.info("EVIDENCIAS - inicio");

        if (evi.getImage1() != null && !evi.getImage1().isEmpty()) {
            long t1 = System.currentTimeMillis();
            ArchivoDTO archivo1 = archivoService.subirArchivo(evi.getImage1());
            incidenteSrv.addEvidencia(evi.getIdIncidente(), archivo1.getId());
            logger.info("EVIDENCIAS: 1 tardó {}ms", System.currentTimeMillis() - t1);
        }

        if (evi.getImage2() != null && !evi.getImage2().isEmpty()) {
            long t2 = System.currentTimeMillis();
            ArchivoDTO archivo2 = archivoService.subirArchivo(evi.getImage2());
            incidenteSrv.addEvidencia(evi.getIdIncidente(), archivo2.getId());
            logger.info("EVIDENCIAS: 2 tardó {}ms", System.currentTimeMillis() - t2);
        }

        if (evi.getImage3() != null && !evi.getImage3().isEmpty()) {
            long t3 = System.currentTimeMillis();
            ArchivoDTO archivo3 = archivoService.subirArchivo(evi.getImage3());
            incidenteSrv.addEvidencia(evi.getIdIncidente(), archivo3.getId());
            logger.info("EVIDENCIAS: 3 tardó {}ms", System.currentTimeMillis() - t3);
        }

        long t4 = System.currentTimeMillis();
        IncidenteDTO dto = new IncidenteDTO();
        dto.setObservacionGeneral(evi.getObservacionGeneral());
        incidenteSrv.update(evi.getIdIncidente(), dto);
        logger.info("EVIDENCIAS: update tardó {}ms", System.currentTimeMillis() - t4);

        logger.info("EVIDENCIAS: TOTAL {}ms", System.currentTimeMillis() - inicioTotal);
    }

    @PostMapping("/buscar")
    public SearchResumenDTO buscarIncidentes(
            @RequestBody(required = false) SearchIncidenteDTO filtros
    ) {
        logger.info(filtros.toString());
        SearchResumenDTO resumen = new SearchResumenDTO();
        resumen.setIncidentes(incidenteSrv.buscarIncidentes(filtros));
        resumen.setTipoResumen(incidenteSrv.resumenIncidentesPorTipo(filtros));
        resumen.setTipoAndMunicipios(incidenteSrv.resumenIncidentesPorMunicipios(filtros));

        return resumen;
    }




}
