package br.com.domine.gestaoti.domain.notificacao;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findByDestinatarioIdOrderByCriadoEmDesc(Long destinatarioId, Pageable pageable);

    long countByDestinatarioIdAndLidaFalse(Long destinatarioId);

    @Modifying
    @Query("UPDATE Notificacao n SET n.lida = true WHERE n.destinatario.id = :usuarioId AND n.lida = false")
    int marcarTodasLidas(@Param("usuarioId") Long usuarioId);
}
