package br.com.domine.gestaoti.domain.chamado.dto;

import br.com.domine.gestaoti.domain.chamado.Comentario;

import java.time.LocalDateTime;

public record ComentarioResponse(
        Long id,
        String texto,
        Long autorId,
        String autorNome,
        LocalDateTime criadoEm
) {
    public static ComentarioResponse from(Comentario c) {
        return new ComentarioResponse(
                c.getId(),
                c.getTexto(),
                c.getAutor().getId(),
                c.getAutor().getNome(),
                c.getCriadoEm()
        );
    }
}
