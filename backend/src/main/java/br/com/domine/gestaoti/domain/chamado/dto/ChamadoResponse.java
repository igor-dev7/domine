package br.com.domine.gestaoti.domain.chamado.dto;

import br.com.domine.gestaoti.domain.chamado.Chamado;
import br.com.domine.gestaoti.enums.CategoriaChamado;
import br.com.domine.gestaoti.enums.PrioridadeChamado;
import br.com.domine.gestaoti.enums.StatusChamado;

import java.time.LocalDateTime;
import java.util.List;

public record ChamadoResponse(
        Long id,
        String titulo,
        String descricao,
        CategoriaChamado categoria,
        PrioridadeChamado prioridade,
        StatusChamado status,
        Long solicitanteId,
        String solicitanteNome,
        Long tecnicoResponsavelId,
        String tecnicoResponsavelNome,
        Long equipamentoId,
        String equipamentoPatrimonio,
        LocalDateTime resolvidoEm,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm,
        List<ComentarioResponse> comentarios
) {
    public static ChamadoResponse from(Chamado c) {
        return new ChamadoResponse(
                c.getId(),
                c.getTitulo(),
                c.getDescricao(),
                c.getCategoria(),
                c.getPrioridade(),
                c.getStatus(),
                c.getSolicitante().getId(),
                c.getSolicitante().getNome(),
                c.getTecnicoResponsavel() != null ? c.getTecnicoResponsavel().getId() : null,
                c.getTecnicoResponsavel() != null ? c.getTecnicoResponsavel().getNome() : null,
                c.getEquipamento() != null ? c.getEquipamento().getId() : null,
                c.getEquipamento() != null ? c.getEquipamento().getPatrimonio() : null,
                c.getResolvidoEm(),
                c.getCriadoEm(),
                c.getAtualizadoEm(),
                c.getComentarios() == null ? List.of()
                        : c.getComentarios().stream().map(ComentarioResponse::from).toList()
        );
    }

    /** Resumo sem comentários — para listagens e dashboard. */
    public static ChamadoResponse resumo(Chamado c) {
        return new ChamadoResponse(
                c.getId(),
                c.getTitulo(),
                c.getDescricao(),
                c.getCategoria(),
                c.getPrioridade(),
                c.getStatus(),
                c.getSolicitante().getId(),
                c.getSolicitante().getNome(),
                c.getTecnicoResponsavel() != null ? c.getTecnicoResponsavel().getId() : null,
                c.getTecnicoResponsavel() != null ? c.getTecnicoResponsavel().getNome() : null,
                c.getEquipamento() != null ? c.getEquipamento().getId() : null,
                c.getEquipamento() != null ? c.getEquipamento().getPatrimonio() : null,
                c.getResolvidoEm(),
                c.getCriadoEm(),
                c.getAtualizadoEm(),
                List.of()
        );
    }
}
