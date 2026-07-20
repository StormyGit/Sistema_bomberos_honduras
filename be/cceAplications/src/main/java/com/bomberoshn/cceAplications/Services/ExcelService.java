package com.bomberoshn.cceAplications.Services;


import com.bomberoshn.cceAplications.Controller.ExcelImportResponseDTO;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.text.Normalizer;
import java.util.*;

@Service
public class ExcelService {

    /*
     * Nombre exacto de la hoja que contiene los reportes.
     */
    private static final String NOMBRE_HOJA = "DATOS 1";

    /*
     * Encabezados que esperamos encontrar dentro de la hoja.
     *
     * Se utilizan los nombres normalizados que producirá
     * el método normalizarEncabezado().
     */
    private static final Set<String> ENCABEZADOS_ESPERADOS = Set.of(
            "tipoEmergencia",
            "fecha",
            "nombre",
            "horaReporte",
            "telefono",
            "ubicacion",
            "descripcion",
            "estadoEmergencia",
            "unidadAsignada",
            "estacion"
    );

    /*
     * Permite cambiar nombres poco descriptivos del Excel.
     *
     * En el archivo, COLUMNA 1 representa el tipo
     * de emergencia.
     */
    private static final Map<String, String> ALIAS_COLUMNAS = Map.of(
            "columna1", "tipoEmergencia"
    );

    public ExcelImportResponseDTO leerExcel(
            MultipartFile archivo
    ) throws Exception {

        validarArchivo(archivo);

        try (
                InputStream inputStream = archivo.getInputStream();
                Workbook workbook = WorkbookFactory.create(inputStream)
        ) {

            if (workbook.getNumberOfSheets() == 0) {
                throw new IllegalArgumentException(
                        "El archivo Excel no contiene ninguna hoja."
                );
            }

            /*
             * DataFormatter permite obtener el valor como se observa
             * visualmente en Excel.
             *
             * Esto es importante para teléfonos, fechas y horas.
             */
            DataFormatter formatter = new DataFormatter(
                    Locale.forLanguageTag("es-HN")
            );

            FormulaEvaluator evaluator = workbook
                    .getCreationHelper()
                    .createFormulaEvaluator();

            /*
             * Buscar específicamente la hoja DATOS 1.
             */
            Sheet hoja = buscarHojaDatos(workbook);

            /*
             * Encontrar la fila que contiene los encabezados.
             */
            Row filaEncabezados = buscarFilaEncabezados(
                    hoja,
                    formatter,
                    evaluator
            );

            if (filaEncabezados == null) {
                throw new IllegalArgumentException(
                        "No se encontraron los encabezados esperados " +
                                "en la hoja '" + NOMBRE_HOJA + "'."
                );
            }

            /*
             * Obtener las columnas y sus posiciones reales.
             */
            List<ColumnaExcel> columnas = obtenerColumnas(
                    filaEncabezados,
                    formatter,
                    evaluator
            );

            if (columnas.isEmpty()) {
                throw new IllegalArgumentException(
                        "La fila de encabezados no contiene columnas válidas."
                );
            }

            List<Map<String, String>> registros = new ArrayList<>();

            /*
             * La lectura comienza en la fila siguiente
             * a los encabezados.
             */
            int primeraFilaDatos = filaEncabezados.getRowNum() + 1;

            for (
                    int indiceFila = primeraFilaDatos;
                    indiceFila <= hoja.getLastRowNum();
                    indiceFila++
            ) {

                Row fila = hoja.getRow(indiceFila);

                if (fila == null) {
                    continue;
                }

                Map<String, String> registro = new LinkedHashMap<>();

                /*
                 * Número de fila real visible en Excel.
                 *
                 * Apache POI comienza desde cero, por eso sumamos 1.
                 */
                registro.put(
                        "filaExcel",
                        String.valueOf(indiceFila + 1)
                );

                boolean filaTieneDatos = false;

                for (ColumnaExcel columna : columnas) {

                    Cell celda = fila.getCell(
                            columna.indice(),
                            Row.MissingCellPolicy.RETURN_BLANK_AS_NULL
                    );

                    String valor = obtenerValorCelda(
                            celda,
                            formatter,
                            evaluator
                    );

                    registro.put(
                            columna.clave(),
                            valor
                    );

                    if (!valor.isBlank()) {
                        filaTieneDatos = true;
                    }
                }

                /*
                 * No devolver filas totalmente vacías.
                 */
                if (filaTieneDatos) {
                    registros.add(registro);
                }
            }

            List<String> nombresColumnas = columnas
                    .stream()
                    .map(ColumnaExcel::clave)
                    .toList();

            return new ExcelImportResponseDTO(
                    archivo.getOriginalFilename(),
                    hoja.getSheetName(),
                    registros.size(),
                    nombresColumnas,
                    registros
            );
        }
    }

    /**
     * Busca la hoja DATOS 1 ignorando diferencias
     * entre mayúsculas, minúsculas y espacios.
     */
    private Sheet buscarHojaDatos(
            Workbook workbook
    ) {

        for (int indice = 0;
             indice < workbook.getNumberOfSheets();
             indice++) {

            Sheet hoja = workbook.getSheetAt(indice);

            String nombreActual = hoja
                    .getSheetName()
                    .trim();

            if (nombreActual.equalsIgnoreCase(NOMBRE_HOJA)) {
                return hoja;
            }
        }

        throw new IllegalArgumentException(
                "No se encontró la hoja '" + NOMBRE_HOJA + "'. " +
                        "Hojas disponibles: " + obtenerNombresHojas(workbook)
        );
    }

    /**
     * Busca la fila que contiene los encabezados reales.
     *
     * No toma simplemente la primera fila con datos, porque
     * podrían existir títulos, códigos u otra información
     * antes de la tabla.
     */
    private Row buscarFilaEncabezados(
            Sheet hoja,
            DataFormatter formatter,
            FormulaEvaluator evaluator
    ) {

        int primeraFila = hoja.getFirstRowNum();

        /*
         * Se revisan hasta las primeras 100 filas.
         */
        int ultimaFilaBusqueda = Math.min(
                hoja.getLastRowNum(),
                primeraFila + 100
        );

        Row mejorFila = null;
        int mayorCantidadCoincidencias = 0;

        for (
                int indiceFila = primeraFila;
                indiceFila <= ultimaFilaBusqueda;
                indiceFila++
        ) {

            Row fila = hoja.getRow(indiceFila);

            if (fila == null || fila.getLastCellNum() <= 0) {
                continue;
            }

            Set<String> encabezadosEncontrados = new HashSet<>();

            for (
                    int indiceCelda = 0;
                    indiceCelda < fila.getLastCellNum();
                    indiceCelda++
            ) {

                Cell celda = fila.getCell(
                        indiceCelda,
                        Row.MissingCellPolicy.RETURN_BLANK_AS_NULL
                );

                String valor = obtenerValorCelda(
                        celda,
                        formatter,
                        evaluator
                );

                if (valor.isBlank()) {
                    continue;
                }

                String clave = convertirEncabezadoAClave(valor);

                if (ENCABEZADOS_ESPERADOS.contains(clave)) {
                    encabezadosEncontrados.add(clave);
                }
            }

            int coincidencias = encabezadosEncontrados.size();

            if (coincidencias > mayorCantidadCoincidencias) {
                mayorCantidadCoincidencias = coincidencias;
                mejorFila = fila;
            }

            /*
             * En este archivo esperamos diez encabezados.
             *
             * Con seis coincidencias ya podemos identificar
             * la fila con seguridad.
             */
            if (coincidencias >= 6) {
                return fila;
            }
        }

        /*
         * Como respaldo, se acepta la mejor fila encontrada
         * solamente cuando contiene al menos cuatro encabezados.
         */
        if (mayorCantidadCoincidencias >= 4) {
            return mejorFila;
        }

        return null;
    }

    /**
     * Obtiene las posiciones de las columnas a partir
     * de la fila de encabezados.
     */
    private List<ColumnaExcel> obtenerColumnas(
            Row filaEncabezados,
            DataFormatter formatter,
            FormulaEvaluator evaluator
    ) {

        List<ColumnaExcel> columnas = new ArrayList<>();

        Set<String> clavesUtilizadas = new HashSet<>();

        int ultimaColumna = filaEncabezados.getLastCellNum();

        for (
                int indiceColumna = 0;
                indiceColumna < ultimaColumna;
                indiceColumna++
        ) {

            Cell celda = filaEncabezados.getCell(
                    indiceColumna,
                    Row.MissingCellPolicy.RETURN_BLANK_AS_NULL
            );

            String encabezadoOriginal = obtenerValorCelda(
                    celda,
                    formatter,
                    evaluator
            );

            /*
             * Ignorar columnas que no tienen encabezado.
             */
            if (encabezadoOriginal.isBlank()) {
                continue;
            }

            String clave = convertirEncabezadoAClave(
                    encabezadoOriginal
            );

            /*
             * Solamente leer las columnas que forman parte
             * del formato esperado.
             *
             * Esto evita incluir columnas auxiliares vacías
             * o columnas desconocidas.
             */
            if (!ENCABEZADOS_ESPERADOS.contains(clave)) {
                continue;
            }

            /*
             * Evitar claves duplicadas.
             */
            String claveBase = clave;
            int contador = 2;

            while (clavesUtilizadas.contains(clave)) {
                clave = claveBase + contador;
                contador++;
            }

            clavesUtilizadas.add(clave);

            columnas.add(
                    new ColumnaExcel(
                            indiceColumna,
                            clave,
                            encabezadoOriginal
                    )
            );
        }

        return columnas;
    }

    /**
     * Convierte un encabezado como:
     *
     * HORA REPORTE -> horaReporte
     * ESTADO EMERGENCIA -> estadoEmergencia
     * UNIDAD ASIGNADA -> unidadAsignada
     * COLUMNA 1 -> tipoEmergencia
     */
    private String convertirEncabezadoAClave(
            String encabezado
    ) {

        String claveNormalizada = normalizarEncabezado(
                encabezado
        );

        return ALIAS_COLUMNAS.getOrDefault(
                claveNormalizada,
                claveNormalizada
        );
    }

    /**
     * Convierte el encabezado en formato camelCase.
     */
    private String normalizarEncabezado(
            String encabezado
    ) {

        if (encabezado == null || encabezado.isBlank()) {
            return "";
        }

        /*
         * Elimina acentos.
         *
         * Ejemplo:
         * DESCRIPCIÓN -> DESCRIPCION
         */
        String texto = Normalizer
                .normalize(
                        encabezado,
                        Normalizer.Form.NFD
                )
                .replaceAll("\\p{M}", "")
                .trim()
                .toLowerCase(Locale.ROOT);

        /*
         * Reemplaza saltos de línea, guiones y caracteres
         * especiales por espacios.
         */
        texto = texto.replaceAll(
                "[^a-z0-9]+",
                " "
        );

        texto = texto.trim();

        if (texto.isBlank()) {
            return "";
        }

        String[] palabras = texto.split("\\s+");

        StringBuilder resultado = new StringBuilder(
                palabras[0]
        );

        for (int indice = 1;
             indice < palabras.length;
             indice++) {

            String palabra = palabras[indice];

            if (palabra.isBlank()) {
                continue;
            }

            resultado.append(
                    Character.toUpperCase(
                            palabra.charAt(0)
                    )
            );

            if (palabra.length() > 1) {
                resultado.append(
                        palabra.substring(1)
                );
            }
        }

        return resultado.toString();
    }

    /**
     * Obtiene el valor mostrado por Excel.
     *
     * DataFormatter evita problemas como:
     *
     * 31830282 -> 3.1830282E7
     * 14:06 -> 0.5875
     * 16/7/2026 -> número serial de Excel
     */
    private String obtenerValorCelda(
            Cell celda,
            DataFormatter formatter,
            FormulaEvaluator evaluator
    ) {

        if (celda == null) {
            return "";
        }

        try {

            String valor = formatter.formatCellValue(
                    celda,
                    evaluator
            );

            return limpiarValor(valor);

        } catch (Exception exception) {

            try {

                String valor = formatter.formatCellValue(
                        celda
                );

                return limpiarValor(valor);

            } catch (Exception ignored) {
                return "";
            }
        }
    }

    /**
     * Limpia espacios y saltos de línea innecesarios.
     */
    private String limpiarValor(
            String valor
    ) {

        if (valor == null) {
            return "";
        }

        return valor
                .replace('\u00A0', ' ')
                .replaceAll("[\\r\\n]+", " ")
                .replaceAll("\\s{2,}", " ")
                .trim();
    }

    /**
     * Verifica que el archivo sea válido.
     */
    private void validarArchivo(
            MultipartFile archivo
    ) {

        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debe seleccionar un archivo Excel."
            );
        }

        String nombreArchivo = archivo.getOriginalFilename();

        if (nombreArchivo == null || nombreArchivo.isBlank()) {
            throw new IllegalArgumentException(
                    "El archivo no tiene un nombre válido."
            );
        }

        String nombreMinuscula = nombreArchivo
                .trim()
                .toLowerCase(Locale.ROOT);

        boolean esExcel = nombreMinuscula.endsWith(".xlsx")
                || nombreMinuscula.endsWith(".xls");

        if (!esExcel) {
            throw new IllegalArgumentException(
                    "Solo se permiten archivos con extensión XLS o XLSX."
            );
        }
    }

    /**
     * Devuelve la lista de hojas existentes para facilitar
     * la identificación de errores.
     */
    private List<String> obtenerNombresHojas(
            Workbook workbook
    ) {

        List<String> nombres = new ArrayList<>();

        for (
                int indice = 0;
                indice < workbook.getNumberOfSheets();
                indice++
        ) {

            nombres.add(
                    workbook.getSheetName(indice)
            );
        }

        return nombres;
    }

    /**
     * Representa una columna encontrada en el Excel.
     */
    private record ColumnaExcel(
            int indice,
            String clave,
            String encabezadoOriginal
    ) {
    }
}