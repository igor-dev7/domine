package br.com.domine.gestaoti.domain.notificacao;

import br.com.domine.gestaoti.domain.notificacao.dto.CaixaNotificacoesResponse;
import br.com.domine.gestaoti.domain.notificacao.dto.PreferenciaResponse;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.enums.TipoNotificacao;

import java.util.List;

public interface NotificacaoService {

    /**
     * Cria notificação para o destinatário, respeitando a preferência dele.
     * Não-bloqueante: falhas são silenciosas pra não derrubar a operação de negócio.
     * Eventos com {@code disparoAutomatico() == false} (ex.: SLA) são ignorados.
     */
    void enviar(Usuario destinatario, TipoNotificacao tipo, String titulo, String descricao, Long chamadoId);

    CaixaNotificacoesResponse listarDoUsuario(Long usuarioId);

    void marcarLida(Long id, Long usuarioId);

    void marcarTodasLidas(Long usuarioId);

    List<PreferenciaResponse> listarPreferencias(Long usuarioId);

    void atualizarPreferencia(Long usuarioId, TipoNotificacao tipo, boolean ativo);
}
