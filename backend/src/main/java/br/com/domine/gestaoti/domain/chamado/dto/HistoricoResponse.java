package br.com.domine.gestaoti.domain.chamado.dto;

import br.com.domine.gestaoti.domain.chamado.HistoricoChamado;
import br.com.domine.gestaoti.enums.TipoEventoHistorico;

import java.time.LocalDateTime;

public record HistoricoResponse(
        Long id,
        TipoEventoHistorico tipoEvento,
        String descricao,
        Long autorId,
        String autorNome,
        LocalDateTime criadoEm
) {
    public static HistoricoResponse from(HistoricoChamado h) {
        return new HistoricoResponse(
                h.getId(),
                h.getTipoEvento(),
                h.getDescricao(),
                h.getAutor() != null ? h.getAutor().getId() : null,
                h.getAutor() != null ? h.getAutor().getNome() : null,
                h.getCriadoEm()
        );
    }
}
