package br.com.domine.gestaoti.domain.equipamento;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoricoEquipamentoRepository extends JpaRepository<HistoricoEquipamento, Long> {

    List<HistoricoEquipamento> findByEquipamentoIdOrderByCriadoEmDesc(Long equipamentoId);
}
