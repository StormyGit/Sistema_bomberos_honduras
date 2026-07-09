package com.bomberoshn.usersAplications.Services;

import com.bomberoshn.usersAplications.DTO.LoginDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    public final JwtService jwtsrv;

    public AuthService(JwtService jwtsrv) {
        this.jwtsrv = jwtsrv;
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
}
