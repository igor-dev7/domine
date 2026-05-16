package br.com.domine.gestaoti.domain.notificacao.dto;

import br.com.domine.gestaoti.enums.TipoNotificacao;
import jakarta.validation.constraints.NotNull;

public record PreferenciaUpdateRequest(
        @NotNull TipoNotificacao tipo,
        @NotNull Boolean ativo
) {}
