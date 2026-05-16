package br.com.domine.gestaoti.domain.notificacao.dto;

import br.com.domine.gestaoti.domain.notificacao.Notificacao;
import br.com.domine.gestaoti.enums.TipoNotificacao;

import java.time.LocalDateTime;

public record NotificacaoResponse(
        Long id,
        TipoNotificacao tipo,
        String titulo,
        String descricao,
        Long chamadoId,
        boolean lida,
        LocalDateTime criadoEm
) {
    public static NotificacaoResponse de(Notificacao n) {
        return new NotificacaoResponse(
                n.getId(),
                n.getTipo(),
                n.getTitulo(),
                n.getDescricao(),
                n.getChamadoId(),
                n.isLida(),
                n.getCriadoEm()
        );
    }
}
