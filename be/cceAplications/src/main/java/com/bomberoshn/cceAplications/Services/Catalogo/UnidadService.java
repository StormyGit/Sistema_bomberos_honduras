package com.bomberoshn.cceAplications.Services.Catalogo;

import com.bomberoshn.cceAplications.DTO.UnidadDTO;
import com.bomberoshn.cceAplications.Entitys.Catalogo.EstacionEntity;
import com.bomberoshn.cceAplications.Entitys.Catalogo.UnidadEntity;
import com.bomberoshn.cceAplications.Repository.Catalogo.EstacionRepository;
import com.bomberoshn.cceAplications.Repository.Catalogo.UnidadRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UnidadService implements IUnidadService {

    private final UnidadRepository unidadRepository;
    private final EstacionRepository estacionRepository;

    // =====================================================
    // OBTENER POR ESTACIÓN
    // =====================================================

    @Override
    public List<UnidadDTO> getByEstacion(
            UUID estacionId,
            Boolean isAvailable
    ) {
        validarEstacionExiste(estacionId);

        return unidadRepository
                .findByEstacionIdAndAvailability(
                        estacionId,
                        isAvailable
                )
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // =====================================================
    // OBTENER POR ID
    // =====================================================

    @Override
    public UnidadDTO getById(UUID id) {
        UnidadEntity unidad = buscarUnidadPorId(id);

        return toDTO(unidad);
    }

    // =====================================================
    // CREAR
    // =====================================================

    @Override
    @Transactional
    public UnidadDTO create(UnidadDTO unidadDTO) {
        validarUnidadDTO(unidadDTO);

        EstacionEntity estacion =
                buscarEstacionPorId(
                        unidadDTO.getIdEstacion()
                );

        UnidadEntity unidad = UnidadEntity.builder()
                .nombre(unidadDTO.getNombre().trim())
                .estacion(estacion)
                .isAvailable(unidadDTO.isDisponible())
                .build();

        UnidadEntity unidadGuardada =
                unidadRepository.save(unidad);

        return toDTO(unidadGuardada);
    }

    // =====================================================
    // ACTUALIZAR
    // =====================================================

    @Override
    @Transactional
    public UnidadDTO update(
            UUID id,
            UnidadDTO unidadDTO
    ) {
        validarUnidadDTO(unidadDTO);

        UnidadEntity unidadExistente =
                buscarUnidadPorId(id);

        EstacionEntity estacion =
                buscarEstacionPorId(
                        unidadDTO.getIdEstacion()
                );

        unidadExistente.setNombre(
                unidadDTO.getNombre().trim()
        );

        unidadExistente.setAvailable(
                unidadDTO.isDisponible()
        );

        unidadExistente.setEstacion(estacion);

        UnidadEntity unidadActualizada =
                unidadRepository.save(
                        unidadExistente
                );

        return toDTO(unidadActualizada);
    }

    // =====================================================
    // ELIMINAR
    // =====================================================

    @Override
    @Transactional
    public void delete(UUID id) {
        UnidadEntity unidad =
                buscarUnidadPorId(id);

        unidadRepository.delete(unidad);
    }


    @Override
    @Transactional
    public UnidadDTO toggleDisponible(
            UUID id,
            Boolean disponible
    ) {
        UnidadEntity unidad = buscarUnidadPorId(id);

        boolean nuevoEstado;

        if (disponible == null) {
            // Si viene null, cambia al estado contrario.
            nuevoEstado = !unidad.isAvailable();
        } else {
            // Si viene true o false, asigna ese valor.
            nuevoEstado = disponible;
        }

        unidad.setAvailable(nuevoEstado);

        UnidadEntity unidadActualizada =
                unidadRepository.save(unidad);

        return toDTO(unidadActualizada);
    }


    // =====================================================
    // CONVERTIR ENTITY A DTO
    // =====================================================

    private UnidadDTO toDTO(
            UnidadEntity unidad
    ) {
        return UnidadDTO.builder()
                .id(unidad.getId())
                .nombre(unidad.getNombre())
                .idEstacion(
                        unidad.getEstacion().getId()
                )
                .disponible(
                        unidad.isAvailable()
                )
                .build();
    }

    // =====================================================
    // BÚSQUEDAS INTERNAS
    // =====================================================

    private UnidadEntity buscarUnidadPorId(
            UUID id
    ) {
        if (id == null) {
            throw new IllegalArgumentException(
                    "El id de la unidad es obligatorio"
            );
        }

        return unidadRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "No se encontró la unidad con id: "
                                        + id
                        )
                );
    }

    private EstacionEntity buscarEstacionPorId(
            UUID estacionId
    ) {
        if (estacionId == null) {
            throw new IllegalArgumentException(
                    "El id de la estación es obligatorio"
            );
        }

        return estacionRepository
                .findById(estacionId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "No se encontró la estación con id: "
                                        + estacionId
                        )
                );
    }

    // =====================================================
    // VALIDACIONES
    // =====================================================

    private void validarEstacionExiste(
            UUID estacionId
    ) {
        if (estacionId == null) {
            throw new IllegalArgumentException(
                    "El id de la estación es obligatorio"
            );
        }

        if (!estacionRepository.existsById(estacionId)) {
            throw new EntityNotFoundException(
                    "No se encontró la estación con id: "
                            + estacionId
            );
        }
    }

    private void validarUnidadDTO(
            UnidadDTO unidadDTO
    ) {
        if (unidadDTO == null) {
            throw new IllegalArgumentException(
                    "La información de la unidad es obligatoria"
            );
        }

        if (
                unidadDTO.getNombre() == null ||
                        unidadDTO.getNombre().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "El nombre de la unidad es obligatorio"
            );
        }

        if (unidadDTO.getNombre().trim().length() > 80) {
            throw new IllegalArgumentException(
                    "El nombre no puede superar los 80 caracteres"
            );
        }

        if (unidadDTO.getIdEstacion() == null) {
            throw new IllegalArgumentException(
                    "El id de la estación es obligatorio"
            );
        }
    }
}