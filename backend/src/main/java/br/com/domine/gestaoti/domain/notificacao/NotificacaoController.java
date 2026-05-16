package br.com.domine.gestaoti.domain.notificacao;

import br.com.domine.gestaoti.domain.auth.UsuarioDetails;
import br.com.domine.gestaoti.domain.notificacao.dto.CaixaNotificacoesResponse;
import br.com.domine.gestaoti.domain.notificacao.dto.PreferenciaResponse;
import br.com.domine.gestaoti.domain.notificacao.dto.PreferenciaUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
@Tag(name = "Notificações", description = "Notificações in-app do usuário logado")
public class NotificacaoController {

    private final NotificacaoService service;

    @GetMapping("/notificacoes")
    @Operation(summary = "Lista as notificações recentes do usuário logado")
    public CaixaNotificacoesResponse listar(@AuthenticationPrincipal UsuarioDetails principal) {
        return service.listarDoUsuario(principal.getUsuario().getId());
    }

    @PatchMapping("/notificacoes/{id}/lida")
    @Operation(summary = "Marca uma notificação como lida")
    public ResponseEntity<Void> marcarLida(@PathVariable Long id, @AuthenticationPrincipal UsuarioDetails principal) {
        service.marcarLida(id, principal.getUsuario().getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/notificacoes/lidas")
    @Operation(summary = "Marca todas as notificações como lidas")
    public ResponseEntity<Void> marcarTodasLidas(@AuthenticationPrincipal UsuarioDetails principal) {
        service.marcarTodasLidas(principal.getUsuario().getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/preferencias/notificacoes")
    @Operation(summary = "Lista as preferências de notificação do usuário")
    public List<PreferenciaResponse> listarPreferencias(@AuthenticationPrincipal UsuarioDetails principal) {
        return service.listarPreferencias(principal.getUsuario().getId());
    }

    @PutMapping("/preferencias/notificacoes")
    @Operation(summary = "Atualiza uma preferência de notificação")
    public ResponseEntity<Void> atualizarPreferencia(
            @Valid @RequestBody PreferenciaUpdateRequest req,
            @AuthenticationPrincipal UsuarioDetails principal
    ) {
        service.atualizarPreferencia(principal.getUsuario().getId(), req.tipo(), req.ativo());
        return ResponseEntity.noContent().build();
    }
}
