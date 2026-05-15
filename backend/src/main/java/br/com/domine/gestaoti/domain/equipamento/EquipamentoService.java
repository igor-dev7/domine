package br.com.domine.gestaoti.domain.equipamento;

import br.com.domine.gestaoti.domain.equipamento.dto.EquipamentoRequest;
import br.com.domine.gestaoti.domain.equipamento.dto.EquipamentoResponse;
import br.com.domine.gestaoti.domain.equipamento.dto.EquipamentoUpdateRequest;
import br.com.domine.gestaoti.enums.StatusEquipamento;
import br.com.domine.gestaoti.enums.TipoEquipamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * POO — Abstração: interface define o contrato, implementação
 * em {@link EquipamentoServiceImpl}.
 */
public interface EquipamentoService {
    Page<EquipamentoResponse> listar(TipoEquipamento tipo, StatusEquipamento status, String patrimonio, Pageable pageable);
    Page<EquipamentoResponse> listarMeus(Pageable pageable);
    EquipamentoResponse buscarPorId(Long id);
    EquipamentoResponse criar(EquipamentoRequest request);
    EquipamentoResponse atualizar(Long id, EquipamentoUpdateRequest request);
    void baixar(Long id);
}
