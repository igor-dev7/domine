package br.com.domine.gestaoti.domain.usuario.dto;

import br.com.domine.gestaoti.enums.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioRequest(
        @NotBlank @Size(min = 3, max = 100) String nome,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Size(min = 6, max = 60) String senha,
        @Size(min = 10, max = 15) String telefone,
        @Size(max = 100) String departamento,
        @NotNull PerfilUsuario perfil
) {}
