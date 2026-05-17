package br.com.domine.gestaoti.domain.chamado;

import br.com.domine.gestaoti.enums.CategoriaChamado;
import br.com.domine.gestaoti.enums.PrioridadeChamado;
import br.com.domine.gestaoti.enums.StatusChamado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChamadoRepository extends JpaRepository<Chamado, Long> {

    @Query("""
            SELECT c FROM Chamado c
            WHERE (:solicitanteId IS NULL OR c.solicitante.id = :solicitanteId)
              AND (:status IS NULL OR c.status = :status)
              AND (:prioridade IS NULL OR c.prioridade = :prioridade)
              AND (:categoria IS NULL OR c.categoria = :categoria)
              AND (:tecnicoId IS NULL OR c.tecnicoResponsavel.id = :tecnicoId)
              AND (:busca = ''
                   OR LOWER(c.titulo) LIKE LOWER(CONCAT('%', :busca, '%'))
                   OR LOWER(c.descricao) LIKE LOWER(CONCAT('%', :busca, '%')))
            ORDER BY c.criadoEm DESC, c.id DESC
            """)
    Page<Chamado> filtrar(
            @Param("solicitanteId") Long solicitanteId,
            @Param("status") StatusChamado status,
            @Param("prioridade") PrioridadeChamado prioridade,
            @Param("categoria") CategoriaChamado categoria,
            @Param("tecnicoId") Long tecnicoId,
            @Param("busca") String busca,
            Pageable pageable
    );

    List<Chamado> findBySolicitanteIdOrderByCriadoEmDesc(Long solicitanteId);

    List<Chamado> findByEquipamentoIdOrderByCriadoEmDesc(Long equipamentoId);

    long countByStatus(StatusChamado status);

    long countByStatusAndResolvidoEmAfter(StatusChamado status, LocalDateTime since);

    @Query("SELECT c.prioridade, COUNT(c) FROM Chamado c GROUP BY c.prioridade")
    List<Object[]> contarPorPrioridade();

    @Query("SELECT c.categoria, COUNT(c) FROM Chamado c GROUP BY c.categoria")
    List<Object[]> contarPorCategoria();

    /**
     * Checa se existe outro chamado (excluindo {@code excluirId}) no status
     * informado, com categoria entre as fornecidas, apontando para o mesmo
     * equipamento. Usado pela regra que mantém o equipamento em MANUTENÇÃO
     * enquanto houver ao menos um chamado HARDWARE/IMPRESSAO em atendimento.
     */
    @Query("""
            SELECT CASE WHEN COUNT(c) > 0 THEN TRUE ELSE FALSE END
            FROM Chamado c
            WHERE c.equipamento.id = :equipamentoId
              AND c.status = :status
              AND c.categoria IN :categorias
              AND c.id <> :excluirId
            """)
    boolean existeOutroNoStatusParaEquipamento(
            @Param("equipamentoId") Long equipamentoId,
            @Param("status") StatusChamado status,
            @Param("categorias") java.util.Collection<CategoriaChamado> categorias,
            @Param("excluirId") Long excluirId
    );
}
