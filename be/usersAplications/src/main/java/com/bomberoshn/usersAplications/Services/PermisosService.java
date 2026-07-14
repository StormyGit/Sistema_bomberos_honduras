package com.bomberoshn.usersAplications.Services;

import com.bomberoshn.usersAplications.DTO.AccionPermisoDTO;
import com.bomberoshn.usersAplications.DTO.CambiarPermisoRequestDTO;
import com.bomberoshn.usersAplications.DTO.ObjetoPermisoResponseDTO;
import com.bomberoshn.usersAplications.Entitys.*;
import com.bomberoshn.usersAplications.Repository.ObjetoRepository;
import com.bomberoshn.usersAplications.Repository.PermisoRepository;
import com.bomberoshn.usersAplications.Repository.RolRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PermisosService implements IPermisosService {

    private final PermisoRepository permisoRepository;
    private final RolRepository rolRepository;
    private final ObjetoRepository objetoRepository;

    public PermisosService(
            PermisoRepository permisoRepository,
            RolRepository rolRepository,
            ObjetoRepository objetoRepository
    ) {
        this.permisoRepository = permisoRepository;
        this.rolRepository = rolRepository;
        this.objetoRepository = objetoRepository;
    }

    /*
     * Devuelve todos los objetos del sistema
     * junto con los permisos marcados para el rol.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ObjetoPermisoResponseDTO> getPermisosPorRol(
            UUID rolId
    ) {

        if (rolId == null) {
            return List.of();
        }

        boolean rolExiste = rolRepository.existsById(rolId);

        if (!rolExiste) {
            return List.of();
        }

        List<ObjetoEntity> objetos =
                objetoRepository.findAll();

        List<PermisoEntity> permisosRol =
                permisoRepository.findAllByRol_Id(rolId);

        /*
         * Creamos un conjunto para verificar los permisos
         * sin consultar la base de datos por cada checkbox.
         */
        Set<PermisoClave> permisosAsignados =
                permisosRol.stream()
                        .map(permiso ->
                                new PermisoClave(
                                        permiso.getObjeto().getId(),
                                        permiso.getAccion()
                                )
                        )
                        .collect(Collectors.toSet());

        return objetos.stream()
                .map(objeto -> {

                    List<AccionPermisoDTO> acciones =
                            obtenerAccionesPorTipo(
                                    objeto.getTipo()
                            )
                                    .stream()
                                    .map(accion ->
                                            new AccionPermisoDTO(
                                                    accion,
                                                    permisosAsignados.contains(
                                                            new PermisoClave(
                                                                    objeto.getId(),
                                                                    accion
                                                            )
                                                    )
                                            )
                                    )
                                    .toList();

                    ObjetoEntity padre = objeto.getPadre();

                    return new ObjetoPermisoResponseDTO(
                            objeto.getId(),
                            objeto.getNombre(),
                            objeto.getTipo(),

                            padre != null
                                    ? padre.getId()
                                    : null,

                            padre != null
                                    ? padre.getNombre()
                                    : null,

                            acciones
                    );
                })
                .toList();
    }

    /*
     * Marca o desmarca un permiso.
     *
     * permitido = true  → inserta el registro.
     * permitido = false → elimina el registro.
     */
    @Override
    @Transactional
    public boolean cambiarPermiso(
            CambiarPermisoRequestDTO dto
    ) {

        if (!datosValidos(dto)) {
            return false;
        }

        RolEntity rol = rolRepository
                .findById(dto.rolId())
                .orElse(null);

        if (rol == null) {
            return false;
        }

        ObjetoEntity objeto = objetoRepository
                .findById(dto.objetoId())
                .orElse(null);

        if (objeto == null) {
            return false;
        }

        if (!accionValidaParaObjeto(
                objeto.getTipo(),
                dto.accion()
        )) {
            return false;
        }

        boolean existe = permisoRepository
                .existsByRol_IdAndObjeto_IdAndAccion(
                        dto.rolId(),
                        dto.objetoId(),
                        dto.accion()
                );

        /*
         * Si el checkbox fue marcado.
         */
        if (dto.permitido()) {

            if (existe) {
                return true;
            }

            PermisoEntity permiso = new PermisoEntity();

            permiso.setRol(rol);
            permiso.setObjeto(objeto);
            permiso.setAccion(dto.accion());

            permisoRepository.save(permiso);

            return true;
        }

        /*
         * Si el checkbox fue desmarcado.
         */
        if (existe) {
            permisoRepository
                    .deleteByRol_IdAndObjeto_IdAndAccion(
                            dto.rolId(),
                            dto.objetoId(),
                            dto.accion()
                    );
        }

        return true;
    }

    /*
     * Determina cuáles acciones debe mostrar la tabla
     * dependiendo del tipo de objeto.
     */
    private List<AccionTipo> obtenerAccionesPorTipo(
            ObjetoTipo tipo
    ) {

        if (tipo == ObjetoTipo.Pagina) {
            return List.of(
                    AccionTipo.View,
                    AccionTipo.Create,
                    AccionTipo.Update,
                    AccionTipo.Delete
            );
        }

        if (
                tipo == ObjetoTipo.Modulo ||
                        tipo == ObjetoTipo.Boton
        ) {
            return List.of(
                    AccionTipo.View
            );
        }

        return List.of();
    }

    /*
     * Impide guardar acciones no permitidas.
     *
     * Por ejemplo:
     * Módulo + Delete → false
     * Botón + Create  → false
     */
    private boolean accionValidaParaObjeto(
            ObjetoTipo tipo,
            AccionTipo accion
    ) {

        if (tipo == null || accion == null) {
            return false;
        }

        return obtenerAccionesPorTipo(tipo)
                .contains(accion);
    }

    private boolean datosValidos(
            CambiarPermisoRequestDTO dto
    ) {

        if (dto == null) {
            return false;
        }

        if (dto.rolId() == null) {
            return false;
        }

        if (dto.objetoId() == null) {
            return false;
        }

        return dto.accion() != null;
    }

    /*
     * Clave interna para identificar:
     * objeto + acción.
     */
    private record PermisoClave(
            UUID objetoId,
            AccionTipo accion
    ) {
    }
}