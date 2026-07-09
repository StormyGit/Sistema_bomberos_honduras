package com.bomberoshn.cceAplications.DTO;

import lombok.*;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenciaDTO {
    private UUID idIncidente;
    private String observacionGeneral;
    private MultipartFile image1;
    private MultipartFile image2;
    private MultipartFile image3;
}
