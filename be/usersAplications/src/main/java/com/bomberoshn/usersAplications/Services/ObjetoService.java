package com.bomberoshn.usersAplications.Services;

import com.bomberoshn.usersAplications.DTO.ObjetoRequestDTO;
import com.bomberoshn.usersAplications.DTO.ObjetoResponseDTO;
import com.bomberoshn.usersAplications.Entitys.ObjetoEntity;
import com.bomberoshn.usersAplications.Repository.ObjetoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service

public class ObjetoService implements IObjetoService {

    public ObjetoService(ObjetoRepository objetoRepository) {
        this.objetoRepository = objetoRepository;
    }

    private final ObjetoRepository objetoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ObjetoResponseDTO> getAll() {

        return objetoRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ObjetoResponseDTO getById(UUID id) {

        if (id == null) {
            return null;
        }

        ObjetoEntity objeto = objetoRepository
                .findById(id)
                .orElse(null);

        if (objeto == null) {
            return null;
        }

        return toDTO(objeto);
    }

    @Override
    @Transactional
    public ObjetoResponseDTO create(
            ObjetoRequestDTO dto
    ) {

        if (!datosValidos(dto)) {
            return null;
        }

        String nombreNormalizado =
                dto.nombre().trim();

        boolean objetoExiste =
                objetoRepository
                        .existsByNombreIgnoreCaseAndTipo(
                                nombreNormalizado,
                                dto.tipo()
                        );

        if (objetoExiste) {
            return null;
        }

        ObjetoEntity objeto = new ObjetoEntity();

        objeto.setNombre(nombreNormalizado);
        objeto.setTipo(dto.tipo());

        ObjetoEntity objetoGuardado =
                objetoRepository.save(objeto);

        return toDTO(objetoGuardado);
    }

    @Override
    @Transactional
    public ObjetoResponseDTO update(
            UUID id,
            ObjetoRequestDTO dto
    ) {

        if (id == null || !datosValidos(dto)) {
            return null;
        }

        ObjetoEntity objeto = objetoRepository
                .findById(id)
                .orElse(null);

        if (objeto == null) {
            return null;
        }

        String nombreNormalizado =
                dto.nombre().trim();

        boolean objetoDuplicado =
                objetoRepository
                        .existsByNombreIgnoreCaseAndTipoAndIdNot(
                                nombreNormalizado,
                                dto.tipo(),
                                id
                        );

        if (objetoDuplicado) {
            return null;
        }

        objeto.setNombre(nombreNormalizado);
        objeto.setTipo(dto.tipo());

        ObjetoEntity objetoActualizado =
                objetoRepository.save(objeto);

        return toDTO(objetoActualizado);
    }

    @Override
    @Transactional
    public boolean delete(UUID id) {

        if (id == null) {
            return false;
        }

        ObjetoEntity objeto = objetoRepository
                .findById(id)
                .orElse(null);

        if (objeto == null) {
            return false;
        }

        objetoRepository.delete(objeto);

        return true;
    }

    private boolean datosValidos(
            ObjetoRequestDTO dto
    ) {

        if (dto == null) {
            return false;
        }

        if (
                dto.nombre() == null ||
                        dto.nombre().isBlank()
        ) {
            return false;
        }

        return dto.tipo() != null;
    }

    private ObjetoResponseDTO toDTO(
            ObjetoEntity objeto
    ) {

        return new ObjetoResponseDTO(
                objeto.getId(),
                objeto.getNombre(),
                objeto.getTipo()
        );
    }
}