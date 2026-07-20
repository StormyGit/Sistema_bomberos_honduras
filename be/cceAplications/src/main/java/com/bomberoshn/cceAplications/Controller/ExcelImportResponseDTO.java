package com.bomberoshn.cceAplications.Controller;

import java.util.List;
import java.util.Map;

public record ExcelImportResponseDTO(

        String archivo,

        String hoja,

        int totalRegistros,

        List<String> columnas,

        List<Map<String, String>> datos

) {
}