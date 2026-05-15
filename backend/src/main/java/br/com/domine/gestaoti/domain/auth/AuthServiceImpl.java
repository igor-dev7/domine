package br.com.domine.gestaoti.domain.auth;

import br.com.domine.gestaoti.domain.auth.dto.LoginRequest;
import br.com.domine.gestaoti.domain.auth.dto.LoginResponse;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha())
        );
        Usuario usuario = ((UsuarioDetails) auth.getPrincipal()).getUsuario();
        String token = jwtService.generateToken(usuario);
        return LoginResponse.of(token, usuario);
    }
}
