package br.com.domine.gestaoti.domain.notificacao.dto;

import java.util.List;

public record CaixaNotificacoesResponse(
        List<NotificacaoResponse> itens,
        long naoLidas
) {}
