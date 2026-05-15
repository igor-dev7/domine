package br.com.domine.gestaoti.domain.equipamento;

import br.com.domine.gestaoti.config.SecurityUtils;
import br.com.domine.gestaoti.domain.equipamento.dto.EquipamentoRequest;
import br.com.domine.gestaoti.domain.equipamento.dto.EquipamentoResponse;
import br.com.domine.gestaoti.domain.equipamento.dto.EquipamentoUpdateRequest;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.domain.usuario.UsuarioRepository;
import br.com.domine.gestaoti.enums.StatusEquipamento;
import br.com.domine.gestaoti.enums.TipoEquipamento;
import br.com.domine.gestaoti.exception.BusinessException;
import br.com.domine.gestaoti.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EquipamentoServiceImpl implements EquipamentoService {

    private final EquipamentoRepository equipamentoRepository;
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
        Equipamento e = Equipamento.builder()
                .patrimonio(request.patrimonio())
                .tipo(request.tipo())
                .marca(request.marca())
                .modelo(request.modelo())
                .numeroSerie(request.numeroSerie())
                .localizacao(request.localizacao())
                .status(request.status())
                .responsavel(resolverResponsavel(request.responsavelId()))
                .dataAquisicao(request.dataAquisicao())
                .observacoes(request.observacoes())
                .build();
        return EquipamentoResponse.from(equipamentoRepository.save(e));
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

        e.setPatrimonio(request.patrimonio());
        e.setTipo(request.tipo());
        e.setMarca(request.marca());
        e.setModelo(request.modelo());
        e.setNumeroSerie(request.numeroSerie());
        e.setLocalizacao(request.localizacao());
        e.setStatus(request.status());
        e.setResponsavel(resolverResponsavel(request.responsavelId()));
        e.setDataAquisicao(request.dataAquisicao());
        e.setObservacoes(request.observacoes());
        return EquipamentoResponse.from(equipamentoRepository.save(e));
    }

    @Override
    @Transactional
    public void baixar(Long id) {
        Equipamento e = equipamentoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Equipamento", id));
        e.baixar();
        equipamentoRepository.save(e);
    }

    private Usuario resolverResponsavel(Long id) {
        if (id == null) return null;
        return usuarioRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Usuário", id));
    }
}
