package com.bomberoshn.cceAplications.Services;

import com.bomberoshn.cceAplications.Controller.ExcelImportResponseDTO;
import com.bomberoshn.cceAplications.Controller.ImportacionIncidentesResponseDTO;
import com.bomberoshn.cceAplications.DTO.UnidadDTO;
import com.bomberoshn.cceAplications.DTO.Catalogo.EstacionResponseDTO;
import com.bomberoshn.cceAplications.Entitys.*;
import com.bomberoshn.cceAplications.Entitys.Catalogo.IncidenteTipoEntity;
import com.bomberoshn.cceAplications.Repository.IncidenteRepository;
import com.bomberoshn.cceAplications.Repository.RecursoRepository;
import com.bomberoshn.cceAplications.Repository.Catalogo.IncidenteTipoRepository;
import com.bomberoshn.cceAplications.Services.Catalogo.UnidadService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExcelIncidenteImportService {

    /*
     * Unidad que se asignará a todos los incidentes importados.
     */
    private static final UUID ID_UNIDAD = UUID.fromString(
            "88315e13-c28a-470c-bd0c-7c5f038608d1"
    );

    /*
     * Estación que se asignará a todos los incidentes importados.
     */
    private static final UUID ID_ESTACION = UUID.fromString(
            "7ad20538-5f7d-5f55-9353-cc89f7ede93d"
    );

    private static final String NO_DEFINIDO = "No definido";

    /*
     * Limitamos la cantidad de errores enviados en el JSON
     * para evitar una respuesta demasiado grande.
     */
    private static final int MAXIMO_ERRORES_RESPUESTA = 100;

    private static final List<DateTimeFormatter> FORMATOS_FECHA = List.of(

            new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern("d/M/uuuu")
                    .toFormatter(Locale.ROOT)
                    .withResolverStyle(ResolverStyle.STRICT),

            new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern("d-M-uuuu")
                    .toFormatter(Locale.ROOT)
                    .withResolverStyle(ResolverStyle.STRICT),

            new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern("uuuu-M-d")
                    .toFormatter(Locale.ROOT)
                    .withResolverStyle(ResolverStyle.STRICT)
    );

    private final ExcelService excelService;
    private final IncidenteRepository incidenteRepository;
    private final RecursoRepository recursoRepository;
    private final IncidenteTipoRepository incidenteTipoRepository;
    private final CatalogoServices catalogoServices;
    private final UnidadService unidadService;

    public ExcelIncidenteImportService(
            ExcelService excelService,
            IncidenteRepository incidenteRepository,
            RecursoRepository recursoRepository,
            IncidenteTipoRepository incidenteTipoRepository,
            CatalogoServices catalogoServices,
            UnidadService unidadService
    ) {

        this.excelService = excelService;
        this.incidenteRepository = incidenteRepository;
        this.recursoRepository = recursoRepository;
        this.incidenteTipoRepository = incidenteTipoRepository;
        this.catalogoServices = catalogoServices;
        this.unidadService = unidadService;
    }

    /**
     * Importa directamente los incidentes desde la hoja DATOS 1.
     *
     * No utiliza IncidenteServices.create(), porque ese método
     * crea automáticamente el tiempo REPORTE y cambia estados.
     */
    @Transactional
    public ImportacionIncidentesResponseDTO importar(
            MultipartFile archivo
    ) throws Exception {

        validarUnidadYEstacion();

        /*
         * El ExcelService ya:
         *
         * 1. Busca la hoja DATOS 1.
         * 2. Lee los encabezados.
         * 3. Convierte las filas a Map<String, String>.
         */
        ExcelImportResponseDTO excel =
                excelService.leerExcel(archivo);

        if (excel.datos() == null || excel.datos().isEmpty()) {
            throw new IllegalArgumentException(
                    "El archivo no contiene registros para importar."
            );
        }

        List<IncidenteEntity> incidentesPreparados =
                new ArrayList<>();

        List<String> errores = new ArrayList<>();

        Map<String, IncidenteTipoEntity> cacheTipos =
                new HashMap<>();

        int registrosOmitidos = 0;

        /*
         * Recorremos las aproximadamente 2,000 filas.
         */
        for (Map<String, String> fila : excel.datos()) {

            String numeroFila = obtenerTexto(
                    fila,
                    "filaExcel",
                    "desconocida"
            );

            try {

                IncidenteEntity incidente = convertirFilaAIncidente(
                        fila,
                        cacheTipos
                );

                incidentesPreparados.add(incidente);

            } catch (Exception exception) {

                registrosOmitidos++;

                agregarError(
                        errores,
                        "Fila " + numeroFila + ": " +
                                obtenerMensajeError(exception)
                );
            }
        }

        if (incidentesPreparados.isEmpty()) {
            throw new IllegalArgumentException(
                    "Ningún registro del Excel pudo convertirse " +
                            "en un incidente válido."
            );
        }

        /*
         * Se guardan todos los incidentes.
         *
         * Como el método tiene @Transactional, cualquier error grave
         * ocasionará rollback y no quedarán datos importados a medias.
         */
        List<IncidenteEntity> incidentesGuardados =
                incidenteRepository.saveAll(incidentesPreparados);

        /*
         * Después de guardar los incidentes ya contamos con sus UUID,
         * por lo que podemos crear los recursos relacionados.
         */
        List<RecursoEntity> recursos = incidentesGuardados
                .stream()
                .map(this::crearRecurso)
                .toList();

        recursoRepository.saveAll(recursos);

        Map<String, Long> estadosImportados =
                incidentesGuardados
                        .stream()
                        .collect(
                                Collectors.groupingBy(
                                        incidente ->
                                                incidente
                                                        .getEstado()
                                                        .name(),
                                        LinkedHashMap::new,
                                        Collectors.counting()
                                )
                        );

        long falsasAlarmas = incidentesGuardados
                .stream()
                .filter(incidente ->
                        Boolean.TRUE.equals(
                                incidente.getIsFalsaAlarma()
                        )
                )
                .count();

        return new ImportacionIncidentesResponseDTO(
                excel.archivo(),
                excel.hoja(),
                excel.totalRegistros(),
                incidentesGuardados.size(),
                recursos.size(),
                registrosOmitidos,
                falsasAlarmas,
                estadosImportados,
                errores
        );
    }

    /**
     * Convierte una fila del JSON producido por ExcelService
     * en un IncidenteEntity.
     */
    private IncidenteEntity convertirFilaAIncidente(
            Map<String, String> fila,
            Map<String, IncidenteTipoEntity> cacheTipos
    ) {

        String tipoEmergencia = obtenerTexto(
                fila,
                "tipoEmergencia",
                ""
        );

        if (tipoEmergencia.isBlank()) {
            throw new IllegalArgumentException(
                    "El tipo de emergencia está vacío."
            );
        }

        String fechaTexto = obtenerTexto(
                fila,
                "fecha",
                ""
        );

        LocalDate fecha = convertirFecha(fechaTexto);

        /*
         * No utilizaremos la hora del reporte.
         *
         * Todos los registros se guardarán a las 00:00 de la
         * fecha indicada en el Excel.
         */
        LocalDateTime fechaIncidente = fecha.atStartOfDay();

        String telefono = obtenerTexto(
                fila,
                "telefono",
                NO_DEFINIDO
        );

        String ubicacion = obtenerTexto(
                fila,
                "ubicacion",
                NO_DEFINIDO
        );

        String descripcion = obtenerTexto(
                fila,
                "descripcion",
                NO_DEFINIDO
        );

        String estadoExcel = obtenerTexto(
                fila,
                "estadoEmergencia",
                ""
        );

        EstadoImportado estadoImportado =
                convertirEstado(estadoExcel);

        IncidenteTipoEntity tipoIncidente =
                obtenerOCrearTipoIncidente(
                        tipoEmergencia,
                        cacheTipos
                );

        /*
         * Los campos utilizados corresponden a los mismos campos
         * que actualmente utiliza tu conversión toEntity().
         */
        return IncidenteEntity.builder()
                .id(null)
                .incidenteTipo(tipoIncidente)
                .idParent(null)

                .estado(estadoImportado.estado())

                /*
                 * Campos generales sin información específica.
                 */
                .departamento(NO_DEFINIDO)

                /*
                 * Ubicación se coloca tanto en colonia como dirección.
                 */
                .colonia(ubicacion)
                .direccion(ubicacion)

                .referencia(NO_DEFINIDO)

                /*
                 * Siempre anónimo.
                 */
                .isAnonimo(true)
                .denuncianteNombre("Anónimo")
                .denuncianteTelefono(telefono)

                /*
                 * No crearemos TiempoEntity, pero sí conservamos
                 * la fecha principal del incidente.
                 */
                .recepcionFecha(LocalDate.from(fechaIncidente))
                .fechaCreacion(LocalDate.from(fechaIncidente).atStartOfDay())
                .recepcionNombre("Importación Excel")
                .recepcionTipo(IncidenteRecepcion.OPERADOR_CCE)

                /*
                 * No contamos con coordenadas.
                 */
                .point(null)

                .isFalsaAlarma(
                        estadoImportado.falsaAlarma()
                )

                /*
                 * La descripción original del Excel se conserva aquí.
                 */
                .observacionGeneral(descripcion)

                .fechaCreacion(fechaIncidente)
                .build();
    }

    /**
     * Crea el recurso relacionado con cada incidente.
     */
    private RecursoEntity crearRecurso(
            IncidenteEntity incidente
    ) {

        RecursoEntity recurso = new RecursoEntity();

        recurso.setIdIncidente(
                incidente.getId()
        );

        recurso.setIdEstacion(
                ID_ESTACION
        );

        recurso.setUnidad(
                ID_UNIDAD
        );

        recurso.setNumPersonal(0);

        recurso.setOficialEncargado(
                NO_DEFINIDO
        );

        recurso.setGalonAgua(BigDecimal.valueOf(0.0));

        recurso.setObservacion(
                "Recurso asignado mediante importación histórica"
        );

        return recurso;
    }

    /**
     * Reglas de estado:
     *
     * REALIZADO       -> Finalizado
     * PENDIENTE       -> Pendiente
     * NO REALIZADO    -> Cancelado
     * FALSA ALARMA    -> Cancelado + isFalsaAlarma true
     * Cualquier otro  -> Pendiente
     */
    private EstadoImportado convertirEstado(
            String estadoOriginal
    ) {

        String estado = normalizarTexto(
                estadoOriginal
        );

        /*
         * Debemos comprobar FALSA ALARMA y NO REALIZADO
         * antes de REALIZADO.
         */
        if (estado.contains("FALSA ALARMA")) {
            return new EstadoImportado(
                    IncidenteEstado.Cancelado,
                    true
            );
        }

        /*
         * startsWith("NO REALIZA") también reconoce errores
         * encontrados en el Excel como:
         *
         * NO REALIZAOO
         * NO REALIZAO
         * NO REALIZADO
         */
        if (estado.startsWith("NO REALIZA")) {
            return new EstadoImportado(
                    IncidenteEstado.Cancelado,
                    false
            );
        }

        /*
         * También acepta REALIZADA o REALIZADOS.
         */
        if (estado.startsWith("REALIZAD")) {
            return new EstadoImportado(
                    IncidenteEstado.Finalizado,
                    false
            );
        }

        if (estado.startsWith("PENDIENTE")) {
            return new EstadoImportado(
                    IncidenteEstado.Pendiente,
                    false
            );
        }

        /*
         * EN ESPERA, EJECUCIÓN, SIN ASIGNAR y cualquier
         * otro valor se importan como Pendiente.
         */
        return new EstadoImportado(
                IncidenteEstado.Pendiente,
                false
        );
    }

    /**
     * Busca el tipo de incidente.
     *
     * Si no existe, lo crea de la misma forma que lo hace
     * actualmente IncidenteServices.
     */
    private IncidenteTipoEntity obtenerOCrearTipoIncidente(
            String nombreOriginal,
            Map<String, IncidenteTipoEntity> cacheTipos
    ) {

        String nombreLimpio = nombreOriginal
                .trim()
                .replaceAll("\\s+", " ");

        if (nombreLimpio.isBlank()) {
            throw new IllegalArgumentException(
                    "El tipo de incidente es obligatorio."
            );
        }

        String claveCache = normalizarTexto(
                nombreLimpio
        );

        IncidenteTipoEntity tipoEnCache =
                cacheTipos.get(claveCache);

        if (tipoEnCache != null) {
            return tipoEnCache;
        }

        IncidenteTipoEntity tipo = incidenteTipoRepository
                .findByNombreIgnoreCase(nombreLimpio)
                .orElseGet(() -> {

                    IncidenteTipoEntity nuevo =
                            new IncidenteTipoEntity();

                    nuevo.setNombre(nombreLimpio);

                    return incidenteTipoRepository.save(nuevo);
                });

        cacheTipos.put(
                claveCache,
                tipo
        );

        return tipo;
    }

    /**
     * Convierte fechas como:
     *
     * 16/7/2026
     * 16/07/2026
     * 16-7-2026
     * 2026-07-16
     */
    private LocalDate convertirFecha(
            String fechaOriginal
    ) {

        if (fechaOriginal == null ||
                fechaOriginal.isBlank()) {

            throw new IllegalArgumentException(
                    "La fecha está vacía."
            );
        }

        String fechaLimpia = fechaOriginal
                .trim()
                .replaceAll("\\s+", " ");

        /*
         * Si accidentalmente viniera una hora después de la fecha,
         * utilizamos solamente la primera parte.
         */
        if (fechaLimpia.contains(" ")) {
            fechaLimpia = fechaLimpia
                    .substring(
                            0,
                            fechaLimpia.indexOf(" ")
                    );
        }

        for (DateTimeFormatter formato : FORMATOS_FECHA) {

            try {
                return LocalDate.parse(
                        fechaLimpia,
                        formato
                );

            } catch (DateTimeParseException ignored) {
                // Intentar el siguiente formato.
            }
        }

        throw new IllegalArgumentException(
                "Formato de fecha no reconocido: " +
                        fechaOriginal
        );
    }

    /**
     * Obtiene un campo del Map sin devolver null.
     */
    private String obtenerTexto(
            Map<String, String> fila,
            String clave,
            String valorDefecto
    ) {

        if (fila == null) {
            return valorDefecto;
        }

        String valor = fila.get(clave);

        if (valor == null || valor.isBlank()) {
            return valorDefecto;
        }

        return valor
                .replace('\u00A0', ' ')
                .replaceAll("[\\r\\n]+", " ")
                .replaceAll("\\s{2,}", " ")
                .trim();
    }

    /**
     * Elimina acentos, espacios dobles y pasa el texto
     * a mayúsculas para realizar comparaciones.
     */
    private String normalizarTexto(
            String texto
    ) {

        if (texto == null) {
            return "";
        }

        return Normalizer
                .normalize(
                        texto,
                        Normalizer.Form.NFD
                )
                .replaceAll("\\p{M}", "")
                .replace('\u00A0', ' ')
                .replaceAll("[\\r\\n]+", " ")
                .replaceAll("\\s{2,}", " ")
                .trim()
                .toUpperCase(Locale.ROOT);
    }

    /**
     * Confirma que los UUID fijos realmente existan antes
     * de comenzar una importación de miles de registros.
     */
    private void validarUnidadYEstacion() {

        UnidadDTO unidad = unidadService.getById(
                ID_UNIDAD
        );

        if (unidad == null) {
            throw new IllegalArgumentException(
                    "No existe la unidad con ID: " +
                            ID_UNIDAD
            );
        }

        EstacionResponseDTO estacion =
                catalogoServices.obtenerEstacionPorId(
                        ID_ESTACION
                );

        if (estacion == null) {
            throw new IllegalArgumentException(
                    "No existe la estación con ID: " +
                            ID_ESTACION
            );
        }
    }

    private void agregarError(
            List<String> errores,
            String mensaje
    ) {

        if (errores.size() < MAXIMO_ERRORES_RESPUESTA) {
            errores.add(mensaje);
        }
    }

    private String obtenerMensajeError(
            Exception exception
    ) {

        if (exception.getMessage() == null ||
                exception.getMessage().isBlank()) {

            return exception
                    .getClass()
                    .getSimpleName();
        }

        return exception.getMessage();
    }

    /**
     * Resultado interno de la conversión del estado.
     */
    private record EstadoImportado(
            IncidenteEstado estado,
            boolean falsaAlarma
    ) {
    }
}