package br.com.domine.gestaoti.domain.notificacao;

import br.com.domine.gestaoti.enums.TipoNotificacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PreferenciaNotificacaoRepository extends JpaRepository<PreferenciaNotificacao, Long> {

    List<PreferenciaNotificacao> findByUsuarioId(Long usuarioId);

    Optional<PreferenciaNotificacao> findByUsuarioIdAndTipo(Long usuarioId, TipoNotificacao tipo);
}
