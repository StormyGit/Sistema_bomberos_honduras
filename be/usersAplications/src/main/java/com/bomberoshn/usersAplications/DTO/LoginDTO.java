package com.bomberoshn.usersAplications.DTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginDTO {
    private String correo;
    private String password;
}
