package br.com.domine.gestaoti.domain.notificacao.dto;

import br.com.domine.gestaoti.enums.TipoNotificacao;

public record PreferenciaResponse(
        TipoNotificacao tipo,
        boolean ativo,
        boolean disponivel
) {}
