package br.com.domine.gestaoti.domain.conta;

import br.com.domine.gestaoti.domain.auth.UsuarioDetails;
import br.com.domine.gestaoti.domain.conta.dto.ExcluirContaRequest;
import br.com.domine.gestaoti.domain.conta.dto.ExportacaoDadosResponse;
import br.com.domine.gestaoti.domain.conta.dto.PreExclusaoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
@Tag(name = "Minha conta", description = "Ações sobre a conta do usuário logado")
public class MeController {

    private final MeService meService;

    @GetMapping("/export")
    @Operation(summary = "Exporta os dados pessoais do usuário logado em JSON (LGPD Art. 18)")
    public ResponseEntity<ExportacaoDadosResponse> exportarDados(
            @AuthenticationPrincipal UsuarioDetails principal
    ) {
        ExportacaoDadosResponse dados = meService.exportarDados(principal.getUsuario());
        String nomeArquivo = "domine-meus-dados-" + principal.getUsuario().getId() + ".json";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + nomeArquivo + "\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(dados);
    }

    @GetMapping("/pre-exclusao")
    @Operation(summary = "Verifica se o usuário precisa promover outro admin antes de excluir a conta")
    public PreExclusaoResponse infoPreExclusao(@AuthenticationPrincipal UsuarioDetails principal) {
        return meService.infoPreExclusao(principal.getUsuario());
    }

    @DeleteMapping
    @Operation(summary = "Exclui (anonimiza) a conta do usuário logado")
    public ResponseEntity<Void> excluirConta(
            @AuthenticationPrincipal UsuarioDetails principal,
            @Valid @RequestBody ExcluirContaRequest request
    ) {
        meService.excluirConta(principal.getUsuario(), request);
        return ResponseEntity.noContent().build();
    }
}
