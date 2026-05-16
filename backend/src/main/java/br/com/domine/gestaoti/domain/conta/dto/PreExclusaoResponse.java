package br.com.domine.gestaoti.domain.conta.dto;

import java.util.List;

public record PreExclusaoResponse(
        boolean precisaPromoverAdmin,
        List<CandidatoPromocao> candidatos
) {
    public record CandidatoPromocao(Long id, String nome, String email) {}
}
