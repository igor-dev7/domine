package br.com.domine.gestaoti.domain.auth;

import br.com.domine.gestaoti.domain.auth.dto.LoginRequest;
import br.com.domine.gestaoti.domain.auth.dto.LoginResponse;
import br.com.domine.gestaoti.domain.sessao.SessaoService;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final SessaoService sessaoService;

    @Override
    public LoginResponse login(LoginRequest request, String userAgent, String ipOrigem) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha())
        );
        Usuario usuario = ((UsuarioDetails) auth.getPrincipal()).getUsuario();

        String jti = UUID.randomUUID().toString();
        String token = jwtService.generateToken(usuario, jti);
        sessaoService.criar(usuario, jti, userAgent, ipOrigem);

        return LoginResponse.of(token, usuario);
    }
}
