package br.com.domine.gestaoti.domain.conta.dto;

import jakarta.validation.constraints.NotBlank;

public record ExcluirContaRequest(
        @NotBlank String confirmacaoEmail,
        /** Se sou o último admin ativo, devo indicar quem deve ser promovido a admin antes da exclusão. */
        Long promoverUsuarioId
) {}
