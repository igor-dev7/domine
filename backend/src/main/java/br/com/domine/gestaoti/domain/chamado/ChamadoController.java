package br.com.domine.gestaoti.domain.chamado;

import br.com.domine.gestaoti.domain.chamado.dto.AtribuirTecnicoRequest;
import br.com.domine.gestaoti.domain.chamado.dto.ChamadoRequest;
import br.com.domine.gestaoti.domain.chamado.dto.ChamadoResponse;
import br.com.domine.gestaoti.domain.chamado.dto.ChamadoUpdateRequest;
import br.com.domine.gestaoti.domain.chamado.dto.ComentarioRequest;
import br.com.domine.gestaoti.domain.chamado.dto.ComentarioResponse;
import br.com.domine.gestaoti.domain.chamado.dto.DashboardResponse;
import br.com.domine.gestaoti.domain.chamado.dto.HistoricoResponse;
import br.com.domine.gestaoti.domain.chamado.dto.StatusUpdateRequest;
import br.com.domine.gestaoti.enums.CategoriaChamado;
import br.com.domine.gestaoti.enums.PrioridadeChamado;
import br.com.domine.gestaoti.enums.StatusChamado;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/chamados")
@RequiredArgsConstructor
@Tag(name = "Chamados", description = "Helpdesk: abertura, atendimento e histórico")
public class ChamadoController {

    private final ChamadoService chamadoService;

    @GetMapping
    public Page<ChamadoResponse> listar(
            @RequestParam(required = false) StatusChamado status,
            @RequestParam(required = false) PrioridadeChamado prioridade,
            @RequestParam(required = false) CategoriaChamado categoria,
            @RequestParam(required = false) Long tecnicoResponsavelId,
            @RequestParam(required = false) String busca,
            Pageable pageable
    ) {
        return chamadoService.listar(status, prioridade, categoria, tecnicoResponsavelId, busca, pageable);
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardResponse dashboard() {
        return chamadoService.dashboard();
    }

    @GetMapping("/{id}")
    public ChamadoResponse buscarPorId(@PathVariable Long id) {
        return chamadoService.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<ChamadoResponse> criar(@Valid @RequestBody ChamadoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chamadoService.criar(request));
    }

    @PutMapping("/{id}")
    public ChamadoResponse atualizar(@PathVariable Long id, @Valid @RequestBody ChamadoUpdateRequest request) {
        return chamadoService.atualizar(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ChamadoResponse alterarStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return chamadoService.alterarStatus(id, request);
    }

    @PatchMapping("/{id}/atribuir")
    @PreAuthorize("hasRole('ADMIN')")
    public ChamadoResponse atribuir(@PathVariable Long id, @Valid @RequestBody AtribuirTecnicoRequest request) {
        return chamadoService.atribuirTecnico(id, request);
    }

    @PostMapping("/{id}/comentarios")
    public ResponseEntity<ComentarioResponse> comentar(@PathVariable Long id, @Valid @RequestBody ComentarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chamadoService.adicionarComentario(id, request));
    }

    @GetMapping("/{id}/historico")
    public List<HistoricoResponse> historico(@PathVariable Long id) {
        return chamadoService.listarHistorico(id);
    }
}
