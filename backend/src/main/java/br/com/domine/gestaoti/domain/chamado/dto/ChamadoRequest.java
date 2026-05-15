package br.com.domine.gestaoti.domain.chamado.dto;

import br.com.domine.gestaoti.enums.CategoriaChamado;
import br.com.domine.gestaoti.enums.PrioridadeChamado;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChamadoRequest(
        @NotBlank @Size(min = 5, max = 150) String titulo,
        @NotBlank @Size(min = 10, max = 2000) String descricao,
        @NotNull CategoriaChamado categoria,
        @NotNull PrioridadeChamado prioridade,
        Long equipamentoId
) {}
