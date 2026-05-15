package br.com.domine.gestaoti.domain.equipamento;

import br.com.domine.gestaoti.enums.StatusEquipamento;
import br.com.domine.gestaoti.enums.TipoEquipamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipamentoRepository extends JpaRepository<Equipamento, Long> {

    boolean existsByPatrimonio(String patrimonio);

    @Query("""
            SELECT e FROM Equipamento e
            WHERE (:tipo IS NULL OR e.tipo = :tipo)
              AND (:status IS NULL OR e.status = :status)
              AND LOWER(e.patrimonio) LIKE LOWER(CONCAT('%', :patrimonio, '%'))
            """)
    Page<Equipamento> filtrar(
            @Param("tipo") TipoEquipamento tipo,
            @Param("status") StatusEquipamento status,
            @Param("patrimonio") String patrimonio,
            Pageable pageable
    );

    Page<Equipamento> findByResponsavelId(Long responsavelId, Pageable pageable);
}
