package com.bomberoshn.cceAplications.Controller;

import com.bomberoshn.cceAplications.DTO.Catalogo.DepartamentoResponseDto;
import com.bomberoshn.cceAplications.DTO.Catalogo.EstacionResponseDTO;
import com.bomberoshn.cceAplications.DTO.Catalogo.MunicipioResponseDto;
import com.bomberoshn.cceAplications.Services.CatalogoServices;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/catalogos")
public class CatalogoController {

    private final CatalogoServices catalogoServices;

    public CatalogoController(CatalogoServices catalogoServices) {
        this.catalogoServices = catalogoServices;
    }

    @GetMapping("/departamentos")
    public List<DepartamentoResponseDto> obtenerDepartamentos() {
        return catalogoServices.obtenerDepartamentos();
    }

    @GetMapping("/departamentos/{departamentoId}/municipios")
    public List<MunicipioResponseDto> obtenerMunicipiosPorDepartamento(
            @PathVariable UUID departamentoId
    ) {
        return catalogoServices.obtenerMunicipiosPorDepartamento(departamentoId);
    }


    @GetMapping("/estacion")
    public List<EstacionResponseDTO> obtenerEstacionesDepartamento(
            @RequestParam(required = false) UUID departamentoId,
            @RequestParam(required = false) Boolean isCentral
    ) {
        return catalogoServices.obtenerEstacionesPorDepartamento(departamentoId, isCentral);
    }

    @GetMapping("/estacion/{departamentoId}/municipio/{municipioId}")
    public List<EstacionResponseDTO> obtenerEstacionesMunicipio(
            @PathVariable UUID departamentoId,
            @PathVariable UUID municipioId,
            @RequestParam(required = false) Boolean isCentral
    ) {
        return catalogoServices.obtenerEstacionesPorDepartamentoYMunicipio(
                departamentoId,
                municipioId,
                isCentral
        );
    }

}