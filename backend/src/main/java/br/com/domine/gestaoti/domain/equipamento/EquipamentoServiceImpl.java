package br.com.domine.gestaoti.domain.equipamento;

import br.com.domine.gestaoti.config.SecurityUtils;
import br.com.domine.gestaoti.domain.equipamento.dto.EquipamentoRequest;
import br.com.domine.gestaoti.domain.equipamento.dto.EquipamentoResponse;
import br.com.domine.gestaoti.domain.equipamento.dto.EquipamentoUpdateRequest;
import br.com.domine.gestaoti.domain.equipamento.dto.HistoricoEquipamentoResponse;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.domain.usuario.UsuarioRepository;
import br.com.domine.gestaoti.enums.StatusEquipamento;
import br.com.domine.gestaoti.enums.TipoEquipamento;
import br.com.domine.gestaoti.enums.TipoEventoEquipamento;
import br.com.domine.gestaoti.exception.BusinessException;
import br.com.domine.gestaoti.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class EquipamentoServiceImpl implements EquipamentoService {

    private final EquipamentoRepository equipamentoRepository;
    private final HistoricoEquipamentoRepository historicoRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<EquipamentoResponse> listar(TipoEquipamento tipo, StatusEquipamento status, String patrimonio, Pageable pageable) {
        // Patrimonio "" casa com todos via LIKE '%%' — evita problema de inferência de tipo em NULL no PostgreSQL
        String patFilter = (patrimonio == null) ? "" : patrimonio;
        return equipamentoRepository.filtrar(tipo, status, patFilter, pageable)
                .map(EquipamentoResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EquipamentoResponse> listarMeus(Pageable pageable) {
        Usuario me = SecurityUtils.usuarioAtual();
        return equipamentoRepository.findByResponsavelId(me.getId(), pageable)
                .map(EquipamentoResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public EquipamentoResponse buscarPorId(Long id) {
        Equipamento e = equipamentoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Equipamento", id));
        return EquipamentoResponse.from(e);
    }

    @Override
    @Transactional
    public EquipamentoResponse criar(EquipamentoRequest request) {
        if (equipamentoRepository.existsByPatrimonio(request.patrimonio())) {
            throw new BusinessException("Já existe equipamento com patrimônio " + request.patrimonio());
        }
        Usuario responsavel = resolverResponsavel(request.responsavelId());
        Equipamento e = Equipamento.builder()
                .patrimonio(request.patrimonio())
                .tipo(request.tipo())
                .marca(request.marca())
                .modelo(request.modelo())
                .numeroSerie(request.numeroSerie())
                .localizacao(request.localizacao())
                .status(request.status())
                .responsavel(responsavel)
                .dataAquisicao(request.dataAquisicao())
                .observacoes(request.observacoes())
                .build();
        e = equipamentoRepository.save(e);

        registrarHistorico(e, TipoEventoEquipamento.CADASTRADO,
                "Cadastrado por " + SecurityUtils.usuarioAtual().getNome()
                        + (responsavel != null ? ", responsável: " + responsavel.getNome() : ""));
        return EquipamentoResponse.from(e);
    }

    @Override
    @Transactional
    public EquipamentoResponse atualizar(Long id, EquipamentoUpdateRequest request) {
        Equipamento e = equipamentoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Equipamento", id));

        if (!e.getPatrimonio().equals(request.patrimonio())
                && equipamentoRepository.existsByPatrimonio(request.patrimonio())) {
            throw new BusinessException("Já existe equipamento com patrimônio " + request.patrimonio());
        }

        StatusEquipamento statusAnterior = e.getStatus();
        Usuario respAnterior = e.getResponsavel();
        Usuario respNovo = resolverResponsavel(request.responsavelId());

        e.setPatrimonio(request.patrimonio());
        e.setTipo(request.tipo());
        e.setMarca(request.marca());
        e.setModelo(request.modelo());
        e.setNumeroSerie(request.numeroSerie());
        e.setLocalizacao(request.localizacao());
        e.setStatus(request.status());
        e.setResponsavel(respNovo);
        e.setDataAquisicao(request.dataAquisicao());
        e.setObservacoes(request.observacoes());
        e = equipamentoRepository.save(e);

        if (statusAnterior != request.status()) {
            registrarHistorico(e, TipoEventoEquipamento.STATUS_ALTERADO,
                    "Status alterado de " + statusAnterior + " para " + request.status());
        }
        if (!Objects.equals(idOuNull(respAnterior), idOuNull(respNovo))) {
            registrarMudancaResponsavel(e, respAnterior, respNovo);
        }
        registrarHistorico(e, TipoEventoEquipamento.ATUALIZADO,
                "Dados atualizados por " + SecurityUtils.usuarioAtual().getNome());

        return EquipamentoResponse.from(e);
    }

    @Override
    @Transactional
    public EquipamentoResponse alterarStatus(Long id, StatusEquipamento status) {
        Equipamento e = equipamentoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Equipamento", id));
        StatusEquipamento anterior = e.getStatus();
        if (anterior == status) {
            return EquipamentoResponse.from(e);
        }
        e.setStatus(status);
        e = equipamentoRepository.save(e);
        registrarHistorico(e, TipoEventoEquipamento.STATUS_ALTERADO,
                "Status alterado de " + anterior + " para " + status);
        return EquipamentoResponse.from(e);
    }

    @Override
    @Transactional
    public EquipamentoResponse alterarResponsavel(Long id, Long responsavelId) {
        Equipamento e = equipamentoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Equipamento", id));
        Usuario anterior = e.getResponsavel();
        Usuario novo = resolverResponsavel(responsavelId);
        if (Objects.equals(idOuNull(anterior), idOuNull(novo))) {
            return EquipamentoResponse.from(e);
        }
        e.setResponsavel(novo);
        e = equipamentoRepository.save(e);
        registrarMudancaResponsavel(e, anterior, novo);
        return EquipamentoResponse.from(e);
    }

    @Override
    @Transactional
    public void baixar(Long id) {
        Equipamento e = equipamentoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Equipamento", id));
        Usuario respAnterior = e.getResponsavel();
        e.baixar();
        equipamentoRepository.save(e);
        registrarHistorico(e, TipoEventoEquipamento.BAIXADO,
                "Equipamento baixado por " + SecurityUtils.usuarioAtual().getNome()
                        + (respAnterior != null
                                ? " (responsável anterior: " + respAnterior.getNome() + ")"
                                : ""));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistoricoEquipamentoResponse> listarHistorico(Long id) {
        if (!equipamentoRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Equipamento", id);
        }
        return historicoRepository.findByEquipamentoIdOrderByCriadoEmDesc(id).stream()
                .map(HistoricoEquipamentoResponse::de)
                .toList();
    }

    private void registrarHistorico(Equipamento e, TipoEventoEquipamento tipo, String descricao) {
        try {
            Usuario autor = SecurityUtils.usuarioAtual();
            historicoRepository.save(HistoricoEquipamento.builder()
                    .equipamento(e)
                    .autor(autor)
                    .tipoEvento(tipo)
                    .descricao(descricao)
                    .build());
        } catch (Exception ignored) {
            // Sem usuário no contexto (ex.: seed) — registra sem autor.
            historicoRepository.save(HistoricoEquipamento.builder()
                    .equipamento(e)
                    .tipoEvento(tipo)
                    .descricao(descricao)
                    .build());
        }
    }

    private void registrarMudancaResponsavel(Equipamento e, Usuario anterior, Usuario novo) {
        if (novo == null) {
            registrarHistorico(e, TipoEventoEquipamento.RESPONSAVEL_REMOVIDO,
                    "Responsável removido"
                            + (anterior != null ? " (era " + anterior.getNome() + ")" : ""));
        } else {
            registrarHistorico(e, TipoEventoEquipamento.RESPONSAVEL_ATRIBUIDO,
                    (anterior != null
                            ? "Responsável alterado de " + anterior.getNome() + " para " + novo.getNome()
                            : "Atribuído a " + novo.getNome()));
        }
    }

    private static Long idOuNull(Usuario u) {
        return u != null ? u.getId() : null;
    }

    private Usuario resolverResponsavel(Long id) {
        if (id == null) return null;
        return usuarioRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Usuário", id));
    }
}
