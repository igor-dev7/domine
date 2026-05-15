package br.com.domine.gestaoti.config;

import br.com.domine.gestaoti.domain.auth.UsuarioDetails;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.exception.BusinessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static Usuario usuarioAtual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UsuarioDetails details)) {
            throw new BusinessException("Nenhum usuário autenticado no contexto");
        }
        return details.getUsuario();
    }
}
