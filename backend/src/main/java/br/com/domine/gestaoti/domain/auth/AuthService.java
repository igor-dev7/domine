package br.com.domine.gestaoti.domain.auth;

import br.com.domine.gestaoti.domain.auth.dto.LoginRequest;
import br.com.domine.gestaoti.domain.auth.dto.LoginResponse;

/**
 * POO — ABSTRAÇÃO via interface de serviço.
 * Implementação em {@link AuthServiceImpl}.
 */
public interface AuthService {
    LoginResponse login(LoginRequest request);
}
