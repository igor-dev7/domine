package br.com.domine.gestaoti.domain.auth.dto;

import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.enums.PerfilUsuario;

public record LoginResponse(
        String token,
        UsuarioMin usuario
) {
    public record UsuarioMin(Long id, String nome, String email, PerfilUsuario perfil) {
        public static UsuarioMin from(Usuario u) {
            return new UsuarioMin(u.getId(), u.getNome(), u.getEmail(), u.getPerfil());
        }
    }

    public static LoginResponse of(String token, Usuario usuario) {
        return new LoginResponse(token, UsuarioMin.from(usuario));
    }
}
