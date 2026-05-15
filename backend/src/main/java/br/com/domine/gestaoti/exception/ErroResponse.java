package br.com.domine.gestaoti.exception;

import java.time.LocalDateTime;
import java.util.List;

public record ErroResponse(
        LocalDateTime timestamp,
        int status,
        String erro,
        List<String> mensagens
) {
    public static ErroResponse of(int status, String erro, String mensagem) {
        return new ErroResponse(LocalDateTime.now(), status, erro, List.of(mensagem));
    }

    public static ErroResponse of(int status, String erro, List<String> mensagens) {
        return new ErroResponse(LocalDateTime.now(), status, erro, mensagens);
    }
}
