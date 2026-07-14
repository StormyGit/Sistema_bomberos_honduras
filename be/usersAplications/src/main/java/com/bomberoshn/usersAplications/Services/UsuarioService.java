package com.bomberoshn.usersAplications.Services;

import com.bomberoshn.usersAplications.DTO.UsuarioCreateDTO;
import com.bomberoshn.usersAplications.DTO.UsuarioResponseDTO;
import com.bomberoshn.usersAplications.DTO.UsuarioUpdateDTO;
import com.bomberoshn.usersAplications.Entitys.Catalogo.DepartamentoEntity;
import com.bomberoshn.usersAplications.Entitys.Catalogo.EstacionEntity;
import com.bomberoshn.usersAplications.Entitys.RolEntity;
import com.bomberoshn.usersAplications.Entitys.UsuarioEntity;
import com.bomberoshn.usersAplications.Repository.Catalogo.DepartamentoRepository;
import com.bomberoshn.usersAplications.Repository.Catalogo.EstacionRepository;
import com.bomberoshn.usersAplications.Repository.RolRepository;
import com.bomberoshn.usersAplications.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService implements IUsuarioService {
    private final UsuarioRepository usuarioRepository;

    private final DepartamentoRepository departamentoRepository;

    private final EstacionRepository estacionRepository;

    private final RolRepository rolRepository;

    private final PasswordEncoder passwordEncoder;



    public UsuarioService(UsuarioRepository usuarioRepository, DepartamentoRepository departamentoRepository, EstacionRepository estacionRepository, RolRepository rolRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.departamentoRepository = departamentoRepository;
        this.estacionRepository = estacionRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }



    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> getAll() {

        return usuarioRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO getById(UUID id) {

        UsuarioEntity usuario = usuarioRepository
                .findById(id)
                .orElse(null);

        if (usuario == null) {
            return null;
        }

        return toDTO(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponseDTO create(
            UsuarioCreateDTO dto
    ) {

        if (!datosCreacionValidos(dto)) {
            return null;
        }

        String correoOrCodigo =
                dto.correoOrCodigo().trim();

        boolean usuarioExiste =
                usuarioRepository
                        .existsByCorreoCodigoIgnoreCase(
                                correoOrCodigo
                        );

        if (usuarioExiste) {
            return null;
        }

        DepartamentoEntity departamento =
                departamentoRepository
                        .findById(dto.departamentoId())
                        .orElse(null);

        if (departamento == null) {
            return null;
        }

        RolEntity rol = rolRepository
                .findById(dto.rolId())
                .orElse(null);

        if (rol == null) {
            return null;
        }

        EstacionEntity estacion =
                buscarEstacion(dto.estacionId());

        if (
                dto.estacionId() != null &&
                        estacion == null
        ) {
            return null;
        }

        if (
                estacion != null &&
                        !estacionPerteneceDepartamento(
                                estacion,
                                departamento
                        )
        ) {
            return null;
        }

        UsuarioEntity usuario = new UsuarioEntity();

        usuario.setNombre(
                dto.nombre().trim()
        );

        usuario.setApellido(
                dto.apellido().trim()
        );

        usuario.setCorreoCodigo(
                correoOrCodigo
        );

        usuario.setPassword(
                passwordEncoder.encode(
                        dto.password()
                )
        );

        usuario.setDepartamento(
                departamento
        );

        usuario.setEstacion(
                estacion
        );

        usuario.setRol(
                rol
        );

        usuario.setTipo(
                dto.tipo()
        );

        UsuarioEntity usuarioGuardado =
                usuarioRepository.save(usuario);

        return toDTO(usuarioGuardado);
    }

    @Override
    @Transactional
    public UsuarioResponseDTO update(
            UUID id,
            UsuarioUpdateDTO dto
    ) {

        UsuarioEntity usuario = usuarioRepository
                .findById(id)
                .orElse(null);

        if (usuario == null) {
            return null;
        }

        if (!datosActualizacionValidos(dto)) {
            return null;
        }

        String correoOrCodigo =
                dto.correoOrCodigo().trim();

        boolean correoDuplicado =
                usuarioRepository
                        .existsByCorreoCodigoIgnoreCaseAndIdNot(
                                correoOrCodigo,
                                id
                        );

        if (correoDuplicado) {
            return null;
        }

        DepartamentoEntity departamento =
                departamentoRepository
                        .findById(dto.departamentoId())
                        .orElse(null);

        if (departamento == null) {
            return null;
        }

        RolEntity rol = rolRepository
                .findById(dto.rolId())
                .orElse(null);

        if (rol == null) {
            return null;
        }

        EstacionEntity estacion =
                buscarEstacion(dto.estacionId());

        if (
                dto.estacionId() != null &&
                        estacion == null
        ) {
            return null;
        }

        if (
                estacion != null &&
                        !estacionPerteneceDepartamento(
                                estacion,
                                departamento
                        )
        ) {
            return null;
        }

        usuario.setNombre(
                dto.nombre().trim()
        );

        usuario.setApellido(
                dto.apellido().trim()
        );

        usuario.setCorreoCodigo(
                correoOrCodigo
        );

        usuario.setDepartamento(
                departamento
        );

        usuario.setEstacion(
                estacion
        );

        usuario.setRol(
                rol
        );

        usuario.setTipo(
                dto.tipo()
        );

        /*
         * Solo cambia la contraseña cuando el frontend
         * envía una nueva contraseña.
         */
        if (
                dto.password() != null &&
                        !dto.password().isBlank()
        ) {
            usuario.setPassword(
                    passwordEncoder.encode(
                            dto.password()
                    )
            );
        }

        UsuarioEntity usuarioActualizado =
                usuarioRepository.save(usuario);

        return toDTO(usuarioActualizado);
    }

    @Override
    @Transactional
    public boolean delete(UUID id) {

        UsuarioEntity usuario = usuarioRepository
                .findById(id)
                .orElse(null);

        if (usuario == null) {
            return false;
        }

        usuarioRepository.delete(usuario);

        return true;
    }

    private EstacionEntity buscarEstacion(
            UUID estacionId
    ) {

        if (estacionId == null) {
            return null;
        }

        return estacionRepository
                .findById(estacionId)
                .orElse(null);
    }

    private boolean estacionPerteneceDepartamento(
            EstacionEntity estacion,
            DepartamentoEntity departamento
    ) {

        if (estacion.getDepartamento() == null) {
            return false;
        }

        return estacion
                .getDepartamento()
                .getId()
                .equals(
                        departamento.getId()
                );
    }

    private boolean datosCreacionValidos(
            UsuarioCreateDTO dto
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

        if (
                dto.apellido() == null ||
                        dto.apellido().isBlank()
        ) {
            return false;
        }

        if (
                dto.correoOrCodigo() == null ||
                        dto.correoOrCodigo().isBlank()
        ) {
            return false;
        }

        if (
                dto.password() == null ||
                        dto.password().isBlank()
        ) {
            return false;
        }

        if (dto.departamentoId() == null) {
            return false;
        }

        if (dto.rolId() == null) {
            return false;
        }

        return dto.tipo() != null;
    }

    private boolean datosActualizacionValidos(
            UsuarioUpdateDTO dto
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

        if (
                dto.apellido() == null ||
                        dto.apellido().isBlank()
        ) {
            return false;
        }

        if (
                dto.correoOrCodigo() == null ||
                        dto.correoOrCodigo().isBlank()
        ) {
            return false;
        }

        if (dto.departamentoId() == null) {
            return false;
        }

        if (dto.rolId() == null) {
            return false;
        }

        return dto.tipo() != null;
    }

    private UsuarioResponseDTO toDTO(
            UsuarioEntity usuario
    ) {

        DepartamentoEntity departamento =
                usuario.getDepartamento();

        EstacionEntity estacion =
                usuario.getEstacion();

        RolEntity rol =
                usuario.getRol();

        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreoCodigo(),
                usuario.getTipo(),

                departamento != null
                        ? departamento.getId()
                        : null,

                departamento != null
                        ? departamento.getNombre()
                        : null,

                estacion != null
                        ? estacion.getId()
                        : null,

                estacion != null
                        ? estacion.getNombre()
                        : null,

                rol != null
                        ? rol.getId()
                        : null,

                rol != null
                        ? rol.getCodigo()
                        : null,

                rol != null
                        ? rol.getNombre()
                        : null
        );
    }
}