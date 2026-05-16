package br.com.domine.gestaoti.domain.sessao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SessaoRepository extends JpaRepository<Sessao, Long> {

    Optional<Sessao> findByJti(String jti);

    List<Sessao> findByUsuarioIdAndRevogadaEmIsNullOrderByCriadoEmDesc(Long usuarioId);

    @Modifying
    @Query("UPDATE Sessao s SET s.ultimoAcessoEm = :agora WHERE s.jti = :jti")
    int atualizarUltimoAcesso(@Param("jti") String jti, @Param("agora") LocalDateTime agora);

    @Modifying
    @Query("UPDATE Sessao s SET s.revogadaEm = :agora WHERE s.usuario.id = :usuarioId AND s.revogadaEm IS NULL")
    int revogarTodasDoUsuario(@Param("usuarioId") Long usuarioId, @Param("agora") LocalDateTime agora);
}
