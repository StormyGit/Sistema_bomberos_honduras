package com.bomberoshn.cceAplications.Services;

import com.bomberoshn.cceAplications.DTO.*;
import com.bomberoshn.cceAplications.DTO.Catalogo.EstacionResponseDTO;
import com.bomberoshn.cceAplications.Entitys.*;
import com.bomberoshn.cceAplications.Repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IncidenteServices implements IIncidenteService {
    private static final Logger logger = LoggerFactory.getLogger(IncidenteServices.class);
    private final IncidenteRepository incidenteRepository;
    private final RecursoRepository recursoRepository;
    private final TiempoRepository tiempoRepository;
    private final EvidenciaRepository evidenciaRepository;
    private final ArchivoService archivoService;
    private final CatalogoServices catalogoServices;

    public IncidenteServices(IncidenteRepository incidenteRepository, RecursoRepository recursoRepository, TiempoRepository tiempoRepository, EvidenciaRepository evidenciaRepository, ArchivoService archivoService, CatalogoServices catalogoServices) {
        this.incidenteRepository = incidenteRepository;
        this.recursoRepository = recursoRepository;
        this.tiempoRepository = tiempoRepository;
        this.evidenciaRepository = evidenciaRepository;
        this.archivoService = archivoService;
        this.catalogoServices = catalogoServices;
    }

    public List<IncidenteDTO> getAll() {
        //logger.info("Obtener todos los incidentes");
/*
        logger.info("Obtener incidentes del día de hoy");

        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().plusDays(1).atStartOfDay();

        List<IncidenteDTO> o = incidenteRepository
                .findByFechaCreacionGreaterThanEqualAndFechaCreacionLessThanOrderByFechaCreacionDesc(
                        inicioDia,
                        finDia
                )
                .stream()
                .map(this::toDTO)
                .toList();

        logger.info("Total de incidentes encontrados hoy: {}", o.size());

        return o;
*/


        List<IncidenteDTO> o = incidenteRepository
                .findAll(Sort.by(Sort.Direction.DESC, "fechaCreacion"))
                .stream()
                .map(this::toDTO)
                .toList();


        logger.info("Total de incidentes encontrados: {}", o.size());

        return o;

    }
    public IncidenteDTO getById(UUID id) {

        if (id == null) {
            throw new RuntimeException("El ID del incidente es obligatorio.");
        }

        IncidenteEntity entity = incidenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El incidente no existe."));

        return toDTO(entity);
    }



    public IncidenteDTO create(IncidenteDTO dto) {
        dto.setId(null);

        IncidenteEntity entity = toEntity(dto);

        entity.setEstado(IncidenteEstado.Pendiente);
        entity = incidenteRepository.save(entity);
        addTimer(entity.getId(), TiempoTipo.REPORTE);
        logger.info("Incidente creado: {}, Id: {}", entity.getIncidente(), entity.getId());

        return toDTO(entity);
    }

    public IncidenteDTO update(UUID id, IncidenteDTO dto) {

        IncidenteEntity entity = incidenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El incidente no existe."));

        updateFields(entity, dto);

        entity = incidenteRepository.save(entity);

        logger.info("Incidente actualizado, Id: {}", entity.getId());

        return toDTO(entity);
    }

    public RecursoDTO addRecurso(UUID idIncidente, RecursoDTO dto){
        IncidenteEntity incidente = incidenteRepository.findById(idIncidente)
                .orElseThrow(() -> new RuntimeException("El incidente no existe."));

        incidente.setPoint(dto.getPoint());
        RecursoEntity recurso = new RecursoEntity();
        recurso.setIdIncidente(idIncidente);
        recurso.setIdEstacion(dto.getIdEstacion());
        recurso.setUnidad(dto.getUnidad());
        recurso.setNumPersonal(dto.getNumPersonal());
        recurso.setOficialEncargado(dto.getOficialEncargado());

        recurso = recursoRepository.save(recurso);
        incidenteRepository.save(incidente);
        addTimer(idIncidente, TiempoTipo.DESPACHO);
        logger.info("recurso agregado, Id: {}", recurso.getId());
        dto.setId(recurso.getId());

        return dto;
    }
    public TiempoDTO addTimer(UUID idIncidente, TiempoTipo tipoTiempo) {

        if (idIncidente == null) {
            throw new RuntimeException("El ID del incidente es obligatorio.");
        }

        if (tipoTiempo == null) {
            throw new RuntimeException("El tipo de tiempo es obligatorio.");
        }

        if (!incidenteRepository.existsById(idIncidente)) {
            throw new RuntimeException("El incidente no existe.");
        }

        boolean yaExiste = tiempoRepository.existsByIdIncidenteAndTipoTiempo(
                idIncidente,
                tipoTiempo
        );

        if (yaExiste) {
            throw new RuntimeException(
                    "Ya existe un tiempo de tipo " + tipoTiempo + " para este incidente."
            );
        }

        LocalDateTime ahora;
        ahora = LocalDateTime.now();

        TiempoEntity entity = TiempoEntity.builder()
                .idIncidente(idIncidente)
                .tipoTiempo(tipoTiempo)
                .horaCreacion(ahora)
                .fechaCreacion(ahora)
                .observacion(null)
                .build();

        entity = tiempoRepository.save(entity);
        switch (tipoTiempo){
            case TiempoTipo.REPORTE,
                 TiempoTipo.DESPACHO -> cambiarEstado(idIncidente, IncidenteEstado.Pendiente);
            case TiempoTipo.SALIDA_ESTACION,
                 TiempoTipo.CONTROLADO,
                 TiempoTipo.LLEGADA -> cambiarEstado(idIncidente, IncidenteEstado.Ejecucion);
            case TiempoTipo.FINALIZACION -> cambiarEstado(idIncidente, IncidenteEstado.Finalizado);
        }


        return toDTO_Tiempo(entity);
    }

    public TiempoDTO getTimer(UUID idIncidente, TiempoTipo tipoTiempo) {

        if (idIncidente == null) {
            throw new RuntimeException("El ID del incidente es obligatorio.");
        }

        if (tipoTiempo == null) {
            throw new RuntimeException("El tipo de tiempo es obligatorio.");
        }

        if (!incidenteRepository.existsById(idIncidente)) {
            throw new RuntimeException("El incidente no existe.");
        }

        return tiempoRepository.findByIdIncidenteAndTipoTiempo(idIncidente, tipoTiempo)
                .map(this::toDTO_Tiempo)
                .orElse(null);
    }

    public IncidenteDTO cambiarEstado(UUID idIncidente, IncidenteEstado estado) {

        if (idIncidente == null) {
            throw new RuntimeException("El ID del incidente es obligatorio.");
        }

        if (estado == null) {
            throw new RuntimeException("El estado del incidente es obligatorio.");
        }

        IncidenteEntity entity = incidenteRepository.findById(idIncidente)
                .orElseThrow(() -> new RuntimeException("El incidente no existe."));

        entity.setEstado(estado);

        entity = incidenteRepository.save(entity);

        return toDTO(entity);
    }

    public void addEvidencia(UUID idIncidente, UUID idArchivo){
        EvidenciasEntity evidencia = new EvidenciasEntity();
        evidencia.setIdIncidente(idIncidente);
        evidencia.setIdArchivo(idArchivo);

        evidenciaRepository.save(evidencia);
    }


    @Transactional(readOnly = true)
    public List<IncidenteDTO> buscarIncidentes(SearchIncidenteDTO filtros) {

        if (filtros == null) {
            filtros = new SearchIncidenteDTO();
        }

        String buscar = filtros.getBuscar();

        if (buscar != null) {
            buscar = buscar.trim();

            if (buscar.isEmpty()) {
                buscar = null;
            }
        }

        LocalDateTime fechaInicio = filtros.getFecha_Inicio() != null
                ? filtros.getFecha_Inicio().atStartOfDay()
                : LocalDateTime.of(1900, 1, 1, 0, 0);

        LocalDateTime fechaFinal = filtros.getFecha_Final() != null
                ? filtros.getFecha_Final().plusDays(1).atStartOfDay()
                : LocalDateTime.of(9999, 12, 31, 23, 59, 59);

        return incidenteRepository.buscarIncidentes(
                        buscar,
                        fechaInicio,
                        fechaFinal,
                        filtros.getTipo(),
                        filtros.getFinalizado(),
                        IncidenteEstado.Finalizado
                )
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<IncidenteTipoResumenDTO> resumenIncidentesPorTipo(SearchIncidenteDTO filtros) {

        if (filtros == null) {
            filtros = new SearchIncidenteDTO();
        }

        String buscar = filtros.getBuscar();

        if (buscar == null) {
            buscar = "";
        } else {
            buscar = buscar.trim();
        }

        LocalDateTime fechaInicio = filtros.getFecha_Inicio() != null
                ? filtros.getFecha_Inicio().atStartOfDay()
                : LocalDateTime.of(1900, 1, 1, 0, 0);

        LocalDateTime fechaFinal = filtros.getFecha_Final() != null
                ? filtros.getFecha_Final().plusDays(1).atStartOfDay()
                : LocalDateTime.of(9999, 12, 31, 23, 59, 59);

        Boolean filtrarTipo = filtros.getTipo() != null;

        IncidenteTipo tipo = filtrarTipo
                ? filtros.getTipo()
                : IncidenteTipo.OTRO;

        List<IncidenteTipoResumenProjection> resultado = incidenteRepository.resumenPorTipo(
                buscar,
                filtrarTipo,
                tipo,
                fechaInicio,
                fechaFinal,
                filtros.getFinalizado(),
                IncidenteEstado.Finalizado
        );

        Map<IncidenteTipo, Long> totalesPorTipo = resultado.stream()
                .collect(Collectors.toMap(
                        IncidenteTipoResumenProjection::getTipo,
                        IncidenteTipoResumenProjection::getTotal
                ));

        return Arrays.stream(IncidenteTipo.values())
                .map(tipoEnum -> new IncidenteTipoResumenDTO(
                        tipoEnum,
                        formatearNombreTipo(tipoEnum),
                        totalesPorTipo.getOrDefault(tipoEnum, 0L)
                ))
                .toList();
    }


    @Transactional(readOnly = true)
    public List<IncidenteMunicipioTipoResumenDTO> resumenIncidentesPorMunicipios(SearchIncidenteDTO filtros) {

        if (filtros == null) {
            filtros = new SearchIncidenteDTO();
        }

        String buscar = filtros.getBuscar();

        if (buscar == null) {
            buscar = "";
        } else {
            buscar = buscar.trim();
        }

        LocalDateTime fechaInicio = filtros.getFecha_Inicio() != null
                ? filtros.getFecha_Inicio().atStartOfDay()
                : LocalDateTime.of(1900, 1, 1, 0, 0);

        LocalDateTime fechaFinal = filtros.getFecha_Final() != null
                ? filtros.getFecha_Final().plusDays(1).atStartOfDay()
                : LocalDateTime.of(9999, 12, 31, 23, 59, 59);

        String tipo = filtros.getTipo() != null
                ? filtros.getTipo().name()
                : null;

        List<IncidentesPorMunicipioTipoProjection> resultado =
                recursoRepository.contarIncidentesPorMunicipioYTipo(
                        fechaInicio,
                        fechaFinal,
                        tipo,
                        buscar
                );

        return resultado.stream()
                .map(item -> {
                    IncidenteTipo incidenteTipo = IncidenteTipo.valueOf(item.getIncidente());

                    return new IncidenteMunicipioTipoResumenDTO(
                            item.getMunicipioId(),
                            item.getMunicipio(),
                            incidenteTipo,
                            formatearNombreTipo(incidenteTipo),
                            item.getTotal()
                    );
                })
                .toList();
    }


    private String formatearNombreTipo(IncidenteTipo tipo) {
        if (tipo == null) {
            return "";
        }

        return tipo.name().replace("_", " ");
    }

    private IncidenteDTO toDTO(IncidenteEntity entity) {
        if (entity == null) return null;

        return IncidenteDTO.builder()
                .id(entity.getId())
                .incidente(entity.getIncidente())
                .idParent(entity.getIdParent())
                .estado(entity.getEstado())
                .departamento(entity.getDepartamento())
                .colonia(entity.getColonia())
                .referencia(entity.getReferencia())
                .direccion(entity.getDireccion())
                .isAnonimo(entity.getIsAnonimo())
                .denuncianteNombre(entity.getDenuncianteNombre())
                .denuncianteTelefono(entity.getDenuncianteTelefono())
                .recepcionFecha(entity.getRecepcionFecha())
                .recepcionNombre(entity.getRecepcionNombre())
                .recepcionTipo(entity.getRecepcionTipo())
                .point(entity.getPoint())
                .isFalsaAlarma(entity.getIsFalsaAlarma())
                .observacionGeneral(entity.getObservacionGeneral())
                .fechaCreacion(entity.getFechaCreacion())
                .fecha(formatFechaHora(entity.getFechaCreacion()))
                .recursos(
                        recursoRepository.findByIdIncidente(entity.getId())
                                .stream()
                                .map(this::toDTO_Recurso)
                                .toList()
                )
                .tiempos(
                        tiempoRepository.findByIdIncidente(entity.getId())
                                .stream()
                                .map(this::toDTO_Tiempo)
                                .toList()
                )
                .images(
                        archivoService.listarArchivosPorIncidente(entity.getId())
                )
                .build();
    }
    private IncidenteEntity toEntity(IncidenteDTO dto) {
        if (dto == null) return null;

        return IncidenteEntity.builder()
                .id(dto.getId())
                .incidente(dto.getIncidente())
                .idParent(dto.getIdParent())
                .estado(dto.getEstado())
                .departamento(dto.getDepartamento())
                .colonia(dto.getColonia())
                .referencia(dto.getReferencia())
                .direccion(dto.getDireccion())
                .isAnonimo(dto.getIsAnonimo())
                .denuncianteNombre(dto.getDenuncianteNombre())
                .denuncianteTelefono(dto.getDenuncianteTelefono())
                .recepcionFecha(dto.getRecepcionFecha())
                .recepcionNombre(dto.getRecepcionNombre())
                .recepcionTipo(dto.getRecepcionTipo())
                .point(dto.getPoint())
                .isFalsaAlarma(dto.getIsFalsaAlarma())
                .observacionGeneral(dto.getObservacionGeneral())
                .fechaCreacion(dto.getFechaCreacion())
                .build();
    }

    private String formatFechaHora(LocalDateTime fecha) {
        if (fecha == null) return null;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        return fecha.format(formatter);
    }
    private void updateFields(IncidenteEntity entity, IncidenteDTO dto) {

        if (dto.getIncidente() != null) {
            entity.setIncidente(dto.getIncidente());
        }

        if (dto.getIdParent() != null) {
            entity.setIdParent(dto.getIdParent());
        }

        if (dto.getEstado() != null) {
            entity.setEstado(dto.getEstado());
        }

        if (dto.getDepartamento() != null) {
            entity.setDepartamento(dto.getDepartamento());
        }

        if (dto.getColonia() != null) {
            entity.setColonia(dto.getColonia());
        }

        if (dto.getReferencia() != null) {
            entity.setReferencia(dto.getReferencia());
        }

        if (dto.getDireccion() != null) {
            entity.setDireccion(dto.getDireccion());
        }

        if (dto.getIsAnonimo() != null) {
            entity.setIsAnonimo(dto.getIsAnonimo());
        }

        if (dto.getDenuncianteNombre() != null) {
            entity.setDenuncianteNombre(dto.getDenuncianteNombre());
        }

        if (dto.getDenuncianteTelefono() != null) {
            entity.setDenuncianteTelefono(dto.getDenuncianteTelefono());
        }

        if (dto.getRecepcionFecha() != null) {
            entity.setRecepcionFecha(dto.getRecepcionFecha());
        }

        if (dto.getRecepcionNombre() != null) {
            entity.setRecepcionNombre(dto.getRecepcionNombre());
        }

        if (dto.getRecepcionTipo() != null) {
            entity.setRecepcionTipo(dto.getRecepcionTipo());
        }

        if (dto.getPoint() != null) {
            entity.setPoint(dto.getPoint());
        }

        if (dto.getIsFalsaAlarma() != null) {
            entity.setIsFalsaAlarma(dto.getIsFalsaAlarma());
        }

        if (dto.getObservacionGeneral() != null) {
            entity.setObservacionGeneral(dto.getObservacionGeneral());
        }
    }

    private RecursoDTO toDTO_Recurso(RecursoEntity entity) {
        if (entity == null) return null;
        EstacionResponseDTO estacion = catalogoServices.obtenerEstacionPorId(entity.getIdEstacion());
        return RecursoDTO.builder()
                .id(entity.getId())
                .idIncidente(entity.getIdIncidente())
                .estacion(estacion.nombre())
                .idEstacion(estacion.id())
                .unidad(entity.getUnidad())
                .oficialEncargado(entity.getOficialEncargado())
                .numPersonal(entity.getNumPersonal())
                .galonAgua(entity.getGalonAgua())
                .observacion(entity.getObservacion())
                .build();
    }
    private TiempoDTO toDTO_Tiempo(TiempoEntity entity) {
        if (entity == null) return null;

        return TiempoDTO.builder()
                .id(entity.getId())
                .idIncidente(entity.getIdIncidente())
                .tipoTiempo(entity.getTipoTiempo())
                .horaCreacion(entity.getHoraCreacion())
                .fechaCreacion(entity.getFechaCreacion())
                .observacion(entity.getObservacion())
                .build();
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
