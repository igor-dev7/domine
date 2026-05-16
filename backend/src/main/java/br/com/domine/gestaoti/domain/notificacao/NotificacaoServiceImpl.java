package br.com.domine.gestaoti.domain.notificacao;

import br.com.domine.gestaoti.domain.notificacao.dto.CaixaNotificacoesResponse;
import br.com.domine.gestaoti.domain.notificacao.dto.NotificacaoResponse;
import br.com.domine.gestaoti.domain.notificacao.dto.PreferenciaResponse;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.domain.usuario.UsuarioRepository;
import br.com.domine.gestaoti.enums.TipoNotificacao;
import br.com.domine.gestaoti.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificacaoServiceImpl implements NotificacaoService {

    private static final Logger log = LoggerFactory.getLogger(NotificacaoServiceImpl.class);
    private static final int LIMITE_LISTAGEM = 30;

    // Eventos que o sistema realmente dispara hoje. SLA ainda não tem scheduler,
    // mas existe como preferência marcada como indisponível.
    private static final Map<TipoNotificacao, Boolean> DISPONIBILIDADE = new EnumMap<>(TipoNotificacao.class);
    static {
        DISPONIBILIDADE.put(TipoNotificacao.NOVO_CHAMADO, true);
        DISPONIBILIDADE.put(TipoNotificacao.ATRIBUICAO, true);
        DISPONIBILIDADE.put(TipoNotificacao.COMENTARIO, true);
        DISPONIBILIDADE.put(TipoNotificacao.RESOLVIDO, true);
        DISPONIBILIDADE.put(TipoNotificacao.SLA, false);
    }

    private final NotificacaoRepository notificacaoRepository;
    private final PreferenciaNotificacaoRepository preferenciaRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public void enviar(Usuario destinatario, TipoNotificacao tipo, String titulo, String descricao, Long chamadoId) {
        if (destinatario == null) return;
        if (!Boolean.TRUE.equals(DISPONIBILIDADE.get(tipo))) return;
        try {
            boolean ativo = preferenciaRepository
                    .findByUsuarioIdAndTipo(destinatario.getId(), tipo)
                    .map(PreferenciaNotificacao::isAtivo)
                    .orElse(true);
            if (!ativo) return;

            Notificacao n = Notificacao.builder()
                    .destinatario(destinatario)
                    .tipo(tipo)
                    .titulo(titulo)
                    .descricao(descricao)
                    .chamadoId(chamadoId)
                    .lida(false)
                    .build();
            notificacaoRepository.save(n);
        } catch (Exception e) {
            // Falha de notificação nunca trava o fluxo de negócio.
            log.warn("Falha ao enviar notificação tipo={} para usuário={}: {}", tipo, destinatario.getId(), e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CaixaNotificacoesResponse listarDoUsuario(Long usuarioId) {
        List<NotificacaoResponse> itens = notificacaoRepository
                .findByDestinatarioIdOrderByCriadoEmDesc(usuarioId, PageRequest.of(0, LIMITE_LISTAGEM))
                .stream()
                .map(NotificacaoResponse::de)
                .toList();
        long naoLidas = notificacaoRepository.countByDestinatarioIdAndLidaFalse(usuarioId);
        return new CaixaNotificacoesResponse(itens, naoLidas);
    }

    @Override
    @Transactional
    public void marcarLida(Long id, Long usuarioId) {
        Notificacao n = notificacaoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Notificação", id));
        if (!n.getDestinatario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Notificação não pertence ao usuário logado.");
        }
        if (!n.isLida()) {
            n.setLida(true);
            notificacaoRepository.save(n);
        }
    }

    @Override
    @Transactional
    public void marcarTodasLidas(Long usuarioId) {
        notificacaoRepository.marcarTodasLidas(usuarioId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PreferenciaResponse> listarPreferencias(Long usuarioId) {
        Map<TipoNotificacao, Boolean> existentes = new EnumMap<>(TipoNotificacao.class);
        preferenciaRepository.findByUsuarioId(usuarioId)
                .forEach(p -> existentes.put(p.getTipo(), p.isAtivo()));

        return List.of(TipoNotificacao.values()).stream()
                .map(tipo -> new PreferenciaResponse(
                        tipo,
                        existentes.getOrDefault(tipo, true),
                        Boolean.TRUE.equals(DISPONIBILIDADE.get(tipo))
                ))
                .toList();
    }

    @Override
    @Transactional
    public void atualizarPreferencia(Long usuarioId, TipoNotificacao tipo, boolean ativo) {
        if (!Boolean.TRUE.equals(DISPONIBILIDADE.get(tipo))) {
            // ignora silenciosamente — usuário não pode habilitar evento que o sistema não dispara
            return;
        }
        PreferenciaNotificacao pref = preferenciaRepository
                .findByUsuarioIdAndTipo(usuarioId, tipo)
                .orElseGet(() -> {
                    Usuario u = usuarioRepository.findById(usuarioId)
                            .orElseThrow(() -> ResourceNotFoundException.of("Usuário", usuarioId));
                    return PreferenciaNotificacao.builder()
                            .usuario(u)
                            .tipo(tipo)
                            .ativo(ativo)
                            .build();
                });
        pref.setAtivo(ativo);
        preferenciaRepository.save(pref);
    }
}
