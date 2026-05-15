package br.com.domine.gestaoti.domain.usuario.dto;

import br.com.domine.gestaoti.enums.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateRequest(
        @NotBlank @Size(min = 3, max = 100) String nome,
        @NotBlank @Email @Size(max = 150) String email,
        @Size(min = 10, max = 15) String telefone,
        @Size(max = 100) String departamento,
        PerfilUsuario perfil,
        Boolean ativo
) {}
