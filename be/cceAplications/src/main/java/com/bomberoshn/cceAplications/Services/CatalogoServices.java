package com.bomberoshn.cceAplications.Services;

import com.bomberoshn.cceAplications.DTO.Catalogo.DepartamentoResponseDto;
import com.bomberoshn.cceAplications.DTO.Catalogo.EstacionResponseDTO;
import com.bomberoshn.cceAplications.DTO.Catalogo.MunicipioResponseDto;
import com.bomberoshn.cceAplications.Entitys.Catalogo.DepartamentoEntity;
import com.bomberoshn.cceAplications.Entitys.Catalogo.EstacionEntity;
import com.bomberoshn.cceAplications.Entitys.Catalogo.MunicipioEntity;
import com.bomberoshn.cceAplications.Repository.Catalogo.DepartamentoRepository;
import com.bomberoshn.cceAplications.Repository.Catalogo.EstacionRepository;
import com.bomberoshn.cceAplications.Repository.Catalogo.MunicipioRepository;
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

    public CatalogoServices(DepartamentoRepository departRepository, MunicipioRepository municipioRepository, EstacionRepository estacionRepository) {
        this.departRepository = departRepository;
        this.municipioRepository = municipioRepository;
        this.estacionRepository = estacionRepository;
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
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Estación no encontrada"
                ));

        return mapToEstacionResponseDto(estacion);
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
}
