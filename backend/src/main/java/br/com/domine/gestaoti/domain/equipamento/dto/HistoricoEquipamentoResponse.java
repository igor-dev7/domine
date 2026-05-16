package br.com.domine.gestaoti.domain.equipamento.dto;

import br.com.domine.gestaoti.domain.equipamento.HistoricoEquipamento;
import br.com.domine.gestaoti.enums.TipoEventoEquipamento;

import java.time.LocalDateTime;

public record HistoricoEquipamentoResponse(
        Long id,
        TipoEventoEquipamento tipoEvento,
        String descricao,
        String autorNome,
        LocalDateTime criadoEm
) {
    public static HistoricoEquipamentoResponse de(HistoricoEquipamento h) {
        return new HistoricoEquipamentoResponse(
                h.getId(),
                h.getTipoEvento(),
                h.getDescricao(),
                h.getAutor() != null ? h.getAutor().getNome() : null,
                h.getCriadoEm()
        );
    }
}
