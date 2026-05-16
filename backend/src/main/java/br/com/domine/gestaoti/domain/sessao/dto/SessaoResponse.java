package br.com.domine.gestaoti.domain.sessao.dto;

import br.com.domine.gestaoti.domain.sessao.Sessao;

import java.time.LocalDateTime;

public record SessaoResponse(
        Long id,
        String userAgent,
        String ipOrigem,
        LocalDateTime criadoEm,
        LocalDateTime ultimoAcessoEm,
        boolean atual
) {
    public static SessaoResponse de(Sessao s, boolean atual) {
        return new SessaoResponse(
                s.getId(),
                s.getUserAgent(),
                s.getIpOrigem(),
                s.getCriadoEm(),
                s.getUltimoAcessoEm(),
                atual
        );
    }
}
