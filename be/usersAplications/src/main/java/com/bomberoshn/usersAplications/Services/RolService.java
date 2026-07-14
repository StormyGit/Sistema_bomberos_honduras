package com.bomberoshn.usersAplications.Services;

import com.bomberoshn.usersAplications.DTO.RolRequestDTO;
import com.bomberoshn.usersAplications.DTO.RolResponseDTO;
import com.bomberoshn.usersAplications.Entitys.RolEntity;
import com.bomberoshn.usersAplications.Repository.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RolService implements IRolService {

    private final RolRepository rolRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RolResponseDTO> getAll() {

        return rolRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RolResponseDTO getById(UUID id) {

        RolEntity rol = rolRepository.findById(id)
                .orElse(null);

        if (rol == null) {
            return null;
        }

        return toDTO(rol);
    }

    @Override
    @Transactional
    public RolResponseDTO create(RolRequestDTO dto) {

        String codigoNormalizado = dto.codigo()
                .trim()
                .toUpperCase();

        if (rolRepository.existsByCodigoIgnoreCase(codigoNormalizado)) {
            return null;
        }

        RolEntity rol = new RolEntity();

        rol.setCodigo(codigoNormalizado);
        rol.setNombre(dto.nombre().trim());
        rol.setDescripcion(dto.descripcion());

        RolEntity rolGuardado = rolRepository.save(rol);

        return toDTO(rolGuardado);
    }

    @Override
    @Transactional
    public RolResponseDTO update(UUID id, RolRequestDTO dto) {

        RolEntity rol = rolRepository.findById(id)
                .orElse(null);

        if (rol == null) {
            return null;
        }

        String codigoNormalizado = dto.codigo()
                .trim()
                .toUpperCase();

        boolean codigoDuplicado =
                rolRepository.existsByCodigoIgnoreCaseAndIdNot(
                        codigoNormalizado,
                        id
                );

        if (codigoDuplicado) {
            return null;
        }

        rol.setCodigo(codigoNormalizado);
        rol.setNombre(dto.nombre().trim());
        rol.setDescripcion(dto.descripcion());

        RolEntity rolActualizado = rolRepository.save(rol);

        return toDTO(rolActualizado);
    }

    @Override
    @Transactional
    public boolean delete(UUID id) {

        RolEntity rol = rolRepository.findById(id)
                .orElse(null);

        if (rol == null) {
            return false;
        }

        rolRepository.delete(rol);

        return true;
    }

    private RolResponseDTO toDTO(RolEntity rol) {

        return new RolResponseDTO(
                rol.getId(),
                rol.getCodigo(),
                rol.getNombre(),
                rol.getDescripcion()
        );
    }
}