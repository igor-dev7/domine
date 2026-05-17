package br.com.domine.gestaoti.domain.artigo.dto;

import br.com.domine.gestaoti.domain.artigo.Artigo;
import br.com.domine.gestaoti.enums.CategoriaArtigo;

import java.time.LocalDateTime;

public record ArtigoResponse(
        Long id,
        String titulo,
        String resumo,
        String conteudo,
        CategoriaArtigo categoria,
        Long autorId,
        String autorNome,
        Long visualizacoes,
        Long uteis,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static ArtigoResponse from(Artigo a) {
        return new ArtigoResponse(
                a.getId(),
                a.getTitulo(),
                a.getResumo(),
                a.getConteudo(),
                a.getCategoria(),
                a.getAutor() != null ? a.getAutor().getId() : null,
                a.getAutor() != null ? a.getAutor().getNome() : null,
                a.getVisualizacoes() != null ? a.getVisualizacoes() : 0L,
                a.getUteis() != null ? a.getUteis() : 0L,
                a.getCriadoEm(),
                a.getAtualizadoEm()
        );
    }
}
