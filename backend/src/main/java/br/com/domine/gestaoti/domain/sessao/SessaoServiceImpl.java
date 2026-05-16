package br.com.domine.gestaoti.domain.sessao;

import br.com.domine.gestaoti.domain.usuario.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessaoServiceImpl implements SessaoService {

    // Evita escrita no banco a cada request — só atualiza last_seen se passou esse tempo.
    private static final Duration THROTTLE_LAST_SEEN = Duration.ofSeconds(30);

    private final SessaoRepository repository;

    @Override
    @Transactional
    public Sessao criar(Usuario usuario, String jti, String userAgent, String ipOrigem) {
        LocalDateTime agora = LocalDateTime.now();
        Sessao sessao = Sessao.builder()
                .usuario(usuario)
                .jti(jti)
                .userAgent(userAgent)
                .ipOrigem(ipOrigem)
                .ultimoAcessoEm(agora)
                .build();
        return repository.save(sessao);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Sessao> listarAtivas(Long usuarioId) {
        return repository.findByUsuarioIdAndRevogadaEmIsNullOrderByCriadoEmDesc(usuarioId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean estaAtiva(String jti) {
        return repository.findByJti(jti)
                .map(Sessao::isAtiva)
                .orElse(false);
    }

    @Override
    @Transactional
    public void atualizarUltimoAcessoSeNecessario(String jti) {
        repository.findByJti(jti).ifPresent(s -> {
            LocalDateTime ultimo = s.getUltimoAcessoEm();
            LocalDateTime agora = LocalDateTime.now();
            if (ultimo == null || Duration.between(ultimo, agora).compareTo(THROTTLE_LAST_SEEN) >= 0) {
                repository.atualizarUltimoAcesso(jti, agora);
            }
        });
    }

    @Override
    @Transactional
    public void revogar(Long sessaoId, Long usuarioId) {
        Sessao sessao = repository.findById(sessaoId)
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Sessão não encontrada"));
        if (!sessao.getUsuario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Você só pode encerrar suas próprias sessões.");
        }
        if (sessao.getRevogadaEm() == null) {
            sessao.setRevogadaEm(LocalDateTime.now());
            repository.save(sessao);
        }
    }
}
