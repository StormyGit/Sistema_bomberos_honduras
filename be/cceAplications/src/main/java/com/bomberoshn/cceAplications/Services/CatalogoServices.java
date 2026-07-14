package com.bomberoshn.cceAplications.Services;

import com.bomberoshn.cceAplications.DTO.Catalogo.DepartamentoResponseDto;
import com.bomberoshn.cceAplications.DTO.Catalogo.EstacionResponseDTO;
import com.bomberoshn.cceAplications.DTO.Catalogo.MunicipioResponseDto;
import com.bomberoshn.cceAplications.DTO.EstacionUpdateRequestDTO;
import com.bomberoshn.cceAplications.Entitys.Catalogo.DepartamentoEntity;
import com.bomberoshn.cceAplications.Entitys.Catalogo.EstacionEntity;
import com.bomberoshn.cceAplications.Entitys.Catalogo.MunicipioEntity;
import com.bomberoshn.cceAplications.Entitys.Catalogo.RegionalEntity;
import com.bomberoshn.cceAplications.Repository.Catalogo.DepartamentoRepository;
import com.bomberoshn.cceAplications.Repository.Catalogo.EstacionRepository;
import com.bomberoshn.cceAplications.Repository.Catalogo.MunicipioRepository;
import com.bomberoshn.cceAplications.Repository.RegionalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CatalogoServices {
    private final DepartamentoRepository departRepository;
    private final MunicipioRepository municipioRepository;
    private final EstacionRepository estacionRepository;
    private final RegionalRepository regionalRepository;

    public CatalogoServices(DepartamentoRepository departRepository, MunicipioRepository municipioRepository, EstacionRepository estacionRepository, RegionalRepository regionalRepository) {
        this.departRepository = departRepository;
        this.municipioRepository = municipioRepository;
        this.estacionRepository = estacionRepository;
        this.regionalRepository = regionalRepository;
    }

    public List<DepartamentoResponseDto> obtenerDepartamentos() {
        return departRepository.findAllByOrderByCodigoAsc()
                .stream()
                .map(this::mapToDepartamentoResponseDto)
                .toList();
    }

    public List<MunicipioResponseDto> obtenerMunicipiosPorDepartamento(UUID departamentoId) {
        return municipioRepository.findByDepartamentoIdOrderByCodigoAsc(departamentoId)
                .stream()
                .map(this::mapToMunicipioResponseDto)
                .toList();
    }


    @Transactional(readOnly = true)
    public List<EstacionResponseDTO> obtenerEstacionesPorDepartamento(
            UUID departamentoId,
            Boolean isCentral
    ) {
        return estacionRepository.buscarPorDepartamento(departamentoId, isCentral)
                .stream()
                .map(this::mapToEstacionResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EstacionResponseDTO> obtenerEstacionesPorDepartamentoYMunicipio(
            UUID departamentoId,
            UUID municipioId,
            Boolean isCentral
    ) {
        return estacionRepository.buscarPorDepartamentoYMunicipio(
                        departamentoId,
                        municipioId,
                        isCentral
                )
                .stream()
                .map(this::mapToEstacionResponseDto)
                .toList();
    }




    @Transactional(readOnly = true)
    public EstacionResponseDTO obtenerEstacionPorId(UUID id) {
        EstacionEntity estacion = estacionRepository.findById(id)
                .orElse(null);
        if (estacion == null){
            return null;
        }

        return mapToEstacionResponseDto(estacion);
    }


    @Transactional
    public EstacionResponseDTO actualizarEstacion(
            UUID id,
            EstacionUpdateRequestDTO dto
    ) {

        if (id == null || dto == null) {
            return null;
        }

        if (
                dto.nombre() == null ||
                        dto.nombre().isBlank()
        ) {
            return null;
        }

        if (
                dto.departamentoId() == null ||
                        dto.municipioId() == null
        ) {
            return null;
        }

        EstacionEntity estacion = estacionRepository
                .findById(id)
                .orElse(null);

        if (estacion == null) {
            return null;
        }

        DepartamentoEntity departamento = departRepository
                .findById(dto.departamentoId())
                .orElse(null);

        if (departamento == null) {
            return null;
        }

        MunicipioEntity municipio = municipioRepository
                .findById(dto.municipioId())
                .orElse(null);

        if (municipio == null) {
            return null;
        }

        /*
         * Validar que el municipio pertenezca
         * al departamento seleccionado.
         */
        if (
                municipio.getDepartamento() == null ||
                        !municipio.getDepartamento()
                                .getId()
                                .equals(departamento.getId())
        ) {
            return null;
        }

        RegionalEntity regional = null;

        /*
         * La regional es opcional.
         */
        if (dto.regionalId() != null) {

            regional = regionalRepository
                    .findById(dto.regionalId())
                    .orElse(null);

            if (regional == null) {
                return null;
            }
        }

        estacion.setNombre(
                dto.nombre().trim()
        );

        estacion.setRegional(regional);
        estacion.setDepartamento(departamento);
        estacion.setMunicipio(municipio);
        estacion.setCentral(dto.central());

        estacion.setPoint(
                limpiarTexto(dto.point())
        );

        EstacionEntity estacionActualizada =
                estacionRepository.save(estacion);

        return mapToEstacionResponseDto(
                estacionActualizada
        );
    }



    private DepartamentoResponseDto mapToDepartamentoResponseDto(DepartamentoEntity departamento) {
        return new DepartamentoResponseDto(
                departamento.getId(),
                departamento.getNombre(),
                departamento.getCodigo()
        );
    }

    private MunicipioResponseDto mapToMunicipioResponseDto(MunicipioEntity municipio) {
        return new MunicipioResponseDto(
                municipio.getId(),
                municipio.getNombre(),
                municipio.getCodigo(),
                municipio.getDepartamento().getId()
        );
    }

    private EstacionResponseDTO mapToEstacionResponseDto(EstacionEntity estacion) {
        return new EstacionResponseDTO(
                estacion.getId(),
                estacion.getNombre(),
                estacion.isCentral(),
                estacion.getDepartamento().getNombre(),
                estacion.getMunicipio().getNombre(),
                estacion.getDepartamento().getId(),
                estacion.getMunicipio().getId(),
                estacion.getPoint()
        );
    }

    private String limpiarTexto(String texto) {

        if (
                texto == null ||
                        texto.isBlank()
        ) {
            return null;
        }

        return texto.trim();
    }
}
