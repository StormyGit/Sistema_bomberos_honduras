package com.bomberoshn.usersAplications.Controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/privado")
    public Map<String, String> privado() {
        return Map.of("message", "Entraste con JWT correctamente");
    }
}