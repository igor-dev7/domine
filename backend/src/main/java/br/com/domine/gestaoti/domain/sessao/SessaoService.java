package br.com.domine.gestaoti.domain.sessao;

import br.com.domine.gestaoti.domain.usuario.Usuario;

import java.util.List;

public interface SessaoService {

    Sessao criar(Usuario usuario, String jti, String userAgent, String ipOrigem);

    List<Sessao> listarAtivas(Long usuarioId);

    boolean estaAtiva(String jti);

    void atualizarUltimoAcessoSeNecessario(String jti);

    void revogar(Long sessaoId, Long usuarioId);
}
