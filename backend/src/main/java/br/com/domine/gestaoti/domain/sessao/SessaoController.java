package br.com.domine.gestaoti.domain.sessao;

import br.com.domine.gestaoti.domain.auth.JwtAuthenticationFilter;
import br.com.domine.gestaoti.domain.auth.UsuarioDetails;
import br.com.domine.gestaoti.domain.sessao.dto.SessaoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/me/sessoes")
@RequiredArgsConstructor
@Tag(name = "Sessões", description = "Sessões ativas do usuário logado")
public class SessaoController {

    private final SessaoService sessaoService;

    @GetMapping
    @Operation(summary = "Lista sessões ativas do usuário logado")
    public List<SessaoResponse> listar(
            @AuthenticationPrincipal UsuarioDetails principal,
            HttpServletRequest request
    ) {
        String jtiAtual = (String) request.getAttribute(JwtAuthenticationFilter.JTI_ATTR);
        return sessaoService.listarAtivas(principal.getUsuario().getId()).stream()
                .map(s -> SessaoResponse.de(s, Objects.equals(s.getJti(), jtiAtual)))
                .toList();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Encerra uma sessão ativa do usuário logado")
    public ResponseEntity<Void> encerrar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioDetails principal
    ) {
        sessaoService.revogar(id, principal.getUsuario().getId());
        return ResponseEntity.noContent().build();
    }
}
