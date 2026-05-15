package br.com.domine.gestaoti.domain.chamado;

import br.com.domine.gestaoti.domain.chamado.dto.AtribuirTecnicoRequest;
import br.com.domine.gestaoti.domain.chamado.dto.ChamadoRequest;
import br.com.domine.gestaoti.domain.chamado.dto.ChamadoResponse;
import br.com.domine.gestaoti.domain.chamado.dto.ChamadoUpdateRequest;
import br.com.domine.gestaoti.domain.chamado.dto.ComentarioRequest;
import br.com.domine.gestaoti.domain.chamado.dto.ComentarioResponse;
import br.com.domine.gestaoti.domain.chamado.dto.DashboardResponse;
import br.com.domine.gestaoti.domain.chamado.dto.HistoricoResponse;
import br.com.domine.gestaoti.domain.chamado.dto.StatusUpdateRequest;
import br.com.domine.gestaoti.enums.CategoriaChamado;
import br.com.domine.gestaoti.enums.PrioridadeChamado;
import br.com.domine.gestaoti.enums.StatusChamado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ChamadoService {
    Page<ChamadoResponse> listar(StatusChamado status, PrioridadeChamado prioridade,
                                 CategoriaChamado categoria, Long tecnicoId, Pageable pageable);
    ChamadoResponse buscarPorId(Long id);
    ChamadoResponse criar(ChamadoRequest request);
    ChamadoResponse atualizar(Long id, ChamadoUpdateRequest request);
    ChamadoResponse alterarStatus(Long id, StatusUpdateRequest request);
    ChamadoResponse atribuirTecnico(Long id, AtribuirTecnicoRequest request);
    ComentarioResponse adicionarComentario(Long chamadoId, ComentarioRequest request);
    List<HistoricoResponse> listarHistorico(Long chamadoId);
    DashboardResponse dashboard();
}
