package br.com.domine.gestaoti.domain.chamado.dto;

import jakarta.validation.constraints.NotNull;

public record AtribuirTecnicoRequest(@NotNull Long tecnicoId) {}
