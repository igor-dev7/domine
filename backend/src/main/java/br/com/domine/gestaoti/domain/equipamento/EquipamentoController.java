package br.com.domine.gestaoti.domain.equipamento;

import br.com.domine.gestaoti.domain.equipamento.dto.EquipamentoRequest;
import br.com.domine.gestaoti.domain.equipamento.dto.EquipamentoResponse;
import br.com.domine.gestaoti.domain.equipamento.dto.EquipamentoUpdateRequest;
import br.com.domine.gestaoti.enums.StatusEquipamento;
import br.com.domine.gestaoti.enums.TipoEquipamento;
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
@RequestMapping("/equipamentos")
@RequiredArgsConstructor
@Tag(name = "Equipamentos", description = "Inventário de equipamentos de TI")
public class EquipamentoController {

    private final EquipamentoService equipamentoService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<EquipamentoResponse> listar(
            @RequestParam(required = false) TipoEquipamento tipo,
            @RequestParam(required = false) StatusEquipamento status,
            @RequestParam(required = false) String patrimonio,
            Pageable pageable
    ) {
        return equipamentoService.listar(tipo, status, patrimonio, pageable);
    }

    @GetMapping("/meus")
    public Page<EquipamentoResponse> listarMeus(Pageable pageable) {
        return equipamentoService.listarMeus(pageable);
    }

    @GetMapping("/{id}")
    public EquipamentoResponse buscarPorId(@PathVariable Long id) {
        return equipamentoService.buscarPorId(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EquipamentoResponse> criar(@Valid @RequestBody EquipamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipamentoService.criar(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public EquipamentoResponse atualizar(@PathVariable Long id, @Valid @RequestBody EquipamentoUpdateRequest request) {
        return equipamentoService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void baixar(@PathVariable Long id) {
        equipamentoService.baixar(id);
    }
}
