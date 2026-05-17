package br.com.domine.gestaoti.domain.artigo;

import br.com.domine.gestaoti.domain.artigo.dto.ArtigoRequest;
import br.com.domine.gestaoti.domain.artigo.dto.ArtigoResponse;
import br.com.domine.gestaoti.enums.CategoriaArtigo;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/artigos")
@RequiredArgsConstructor
@Tag(name = "Artigos", description = "Base de conhecimento")
public class ArtigoController {

    private final ArtigoService artigoService;

    @GetMapping
    public Page<ArtigoResponse> listar(
            @RequestParam(required = false) CategoriaArtigo categoria,
            @RequestParam(required = false) String busca,
            Pageable pageable
    ) {
        return artigoService.listar(categoria, busca, pageable);
    }

    @GetMapping("/{id}")
    public ArtigoResponse buscarPorId(
            @PathVariable Long id,
            @RequestParam(name = "registrarVisualizacao", defaultValue = "false") boolean registrarVisualizacao
    ) {
        return artigoService.buscarPorId(id, registrarVisualizacao);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArtigoResponse> criar(@Valid @RequestBody ArtigoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(artigoService.criar(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ArtigoResponse atualizar(@PathVariable Long id, @Valid @RequestBody ArtigoRequest request) {
        return artigoService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        artigoService.excluir(id);
    }

    @PostMapping("/{id}/uteis")
    public ArtigoResponse marcarUtil(@PathVariable Long id) {
        return artigoService.marcarUtil(id);
    }
}
