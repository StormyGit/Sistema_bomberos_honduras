package com.bomberoshn.usersAplications.Services;

import com.bomberoshn.usersAplications.DTO.LoginDTO;
import com.bomberoshn.usersAplications.DTO.LoginResponseDTO;
import com.bomberoshn.usersAplications.DTO.UsuarioResponseDTO;
import com.bomberoshn.usersAplications.Entitys.Catalogo.DepartamentoEntity;
import com.bomberoshn.usersAplications.Entitys.Catalogo.EstacionEntity;
import com.bomberoshn.usersAplications.Entitys.Seguridad.RolEntity;
import com.bomberoshn.usersAplications.Entitys.Seguridad.UsuarioEntity;
import com.bomberoshn.usersAplications.Repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    public final JwtService jwtsrv;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(JwtService jwtsrv, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.jwtsrv = jwtsrv;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String Login(LoginDTO loginDTO){
        String Correo = "admin";
        String Password = "admin";

        logger.info(loginDTO.toString());
        if ("admin".equals(loginDTO.getCorreo()) && "admin".equals(loginDTO.getPassword())) {
            String token = jwtsrv.generateToken(loginDTO.getCorreo());
            return token;
        }
        return null;
    }
    @Transactional(readOnly = true)
    public LoginResponseDTO loginAdminApp(LoginDTO loginDTO) {

        if (loginDTO == null) {
            return null;
        }

        if (
                loginDTO.getCorreo() == null ||
                        loginDTO.getCorreo().isBlank()
        ) {
            return null;
        }

        if (
                loginDTO.getPassword() == null ||
                        loginDTO.getPassword().isBlank()
        ) {
            return null;
        }

        String correoCodigo = loginDTO
                .getCorreo()
                .trim();

        UsuarioEntity usuario = usuarioRepository
                .findByCorreoCodigoIgnoreCase(correoCodigo)
                .orElse(null);

        if (usuario == null) {
            return null;
        }

        boolean passwordCorrecta = passwordEncoder.matches(
                loginDTO.getPassword(),
                usuario.getPassword()
        );

        if (!passwordCorrecta) {
            return null;
        }

        String token = jwtsrv.generateToken(
                usuario.getCorreoCodigo()
        );

        UsuarioResponseDTO usuarioDTO = toUsuarioDTO(usuario);

        return new LoginResponseDTO(
                token,
                usuarioDTO
        );
    }

    private UsuarioResponseDTO toUsuarioDTO(
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
