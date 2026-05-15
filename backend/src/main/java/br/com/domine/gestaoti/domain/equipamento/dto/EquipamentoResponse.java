package br.com.domine.gestaoti.domain.equipamento.dto;

import br.com.domine.gestaoti.domain.equipamento.Equipamento;
import br.com.domine.gestaoti.enums.StatusEquipamento;
import br.com.domine.gestaoti.enums.TipoEquipamento;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EquipamentoResponse(
        Long id,
        String patrimonio,
        TipoEquipamento tipo,
        String marca,
        String modelo,
        String numeroSerie,
        String localizacao,
        StatusEquipamento status,
        Long responsavelId,
        String responsavelNome,
        LocalDate dataAquisicao,
        String observacoes,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static EquipamentoResponse from(Equipamento e) {
        return new EquipamentoResponse(
                e.getId(),
                e.getPatrimonio(),
                e.getTipo(),
                e.getMarca(),
                e.getModelo(),
                e.getNumeroSerie(),
                e.getLocalizacao(),
                e.getStatus(),
                e.getResponsavel() != null ? e.getResponsavel().getId() : null,
                e.getResponsavel() != null ? e.getResponsavel().getNome() : null,
                e.getDataAquisicao(),
                e.getObservacoes(),
                e.getCriadoEm(),
                e.getAtualizadoEm()
        );
    }
}
