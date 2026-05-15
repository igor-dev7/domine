package br.com.domine.gestaoti.domain.chamado.dto;

import br.com.domine.gestaoti.enums.StatusChamado;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull StatusChamado status) {}
