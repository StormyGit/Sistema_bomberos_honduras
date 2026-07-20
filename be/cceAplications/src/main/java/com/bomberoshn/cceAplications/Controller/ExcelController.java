package com.bomberoshn.cceAplications.Controller;


import com.bomberoshn.cceAplications.Services.ExcelIncidenteImportService;
import com.bomberoshn.cceAplications.Services.ExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/excel")
@RequiredArgsConstructor
public class ExcelController {

    private final ExcelService excelService;
    private final ExcelIncidenteImportService excelIncidenteImportService;

    @PostMapping(
            value = "/leer",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> leerExcel(
            @RequestParam("archivo") MultipartFile archivo
    ) {

        try {

            ExcelImportResponseDTO resultado =
                    excelService.leerExcel(archivo);

            return ResponseEntity.ok(resultado);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "mensaje",
                                    exception.getMessage()
                            )
                    );

        } catch (Exception exception) {

            String detalle = exception.getMessage() == null
                    ? "Error desconocido"
                    : exception.getMessage();

            return ResponseEntity
                    .status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(
                            Map.of(
                                    "mensaje",
                                    "No se pudo leer el archivo Excel.",
                                    "detalle",
                                    detalle
                            )
                    );
        }
    }

    @PostMapping(
            value = "/importar-incidentes",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> importarIncidentes(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam(
                    value = "confirmar",
                    defaultValue = "false"
            ) boolean confirmar
    ) {

        if (!confirmar) {
            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "mensaje",
                                    "Debe enviar confirmar=true. " +
                                            "Esta operación insertará los incidentes " +
                                            "directamente en la base de datos."
                            )
                    );
        }

        try {

            ImportacionIncidentesResponseDTO resultado =
                    excelIncidenteImportService.importar(archivo);

            return ResponseEntity.ok(resultado);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "mensaje",
                                    exception.getMessage()
                            )
                    );

        } catch (Exception exception) {

            String detalle = exception.getMessage() == null
                    ? exception.getClass().getSimpleName()
                    : exception.getMessage();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "mensaje",
                                    "No se pudo completar la importación.",
                                    "detalle",
                                    detalle
                            )
                    );
        }
    }


}