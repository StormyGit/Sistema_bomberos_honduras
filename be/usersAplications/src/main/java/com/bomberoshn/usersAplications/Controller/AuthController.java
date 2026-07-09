package com.bomberoshn.usersAplications.Controller;

import com.bomberoshn.usersAplications.DTO.LoginDTO;
import com.bomberoshn.usersAplications.Services.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


@RestController
@RequestMapping("/auth")
public class AuthController {
    private AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {

        String Token = authService.Login(loginDTO);

        if (Token.equals(null)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Credenciales incorrectas"));
        }

        return ResponseEntity.ok(Map.of(
                "token", Token,
                "correo", loginDTO.getCorreo(),
                "tipo", "Bearer"
        ));
    }
}
