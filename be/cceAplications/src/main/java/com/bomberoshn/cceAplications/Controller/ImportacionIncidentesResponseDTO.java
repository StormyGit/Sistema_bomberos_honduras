package com.bomberoshn.cceAplications.Controller;

import java.util.List;
import java.util.Map;

public record ImportacionIncidentesResponseDTO(

        String archivo,

        String hoja,

        int totalLeidos,

        int incidentesImportados,

        int recursosCreados,

        int registrosOmitidos,

        long falsasAlarmas,

        Map<String, Long> estadosImportados,

        List<String> errores

) {
}