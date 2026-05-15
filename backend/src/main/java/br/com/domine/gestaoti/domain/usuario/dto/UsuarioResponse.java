package br.com.domine.gestaoti.domain.usuario.dto;

import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.enums.PerfilUsuario;

import java.time.LocalDateTime;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        String telefone,
        String departamento,
        PerfilUsuario perfil,
        Boolean ativo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static UsuarioResponse from(Usuario u) {
        return new UsuarioResponse(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getTelefone(),
                u.getDepartamento(),
                u.getPerfil(),
                u.getAtivo(),
                u.getCriadoEm(),
                u.getAtualizadoEm()
        );
    }
}
