package br.com.domine.gestaoti.domain.chamado;

import br.com.domine.gestaoti.config.SecurityUtils;
import br.com.domine.gestaoti.domain.chamado.dto.AtribuirTecnicoRequest;
import br.com.domine.gestaoti.domain.chamado.dto.ChamadoRequest;
import br.com.domine.gestaoti.domain.chamado.dto.ChamadoResponse;
import br.com.domine.gestaoti.domain.chamado.dto.ChamadoUpdateRequest;
import br.com.domine.gestaoti.domain.chamado.dto.ComentarioRequest;
import br.com.domine.gestaoti.domain.chamado.dto.ComentarioResponse;
import br.com.domine.gestaoti.domain.chamado.dto.DashboardResponse;
import br.com.domine.gestaoti.domain.chamado.dto.HistoricoResponse;
import br.com.domine.gestaoti.domain.chamado.dto.StatusUpdateRequest;
import br.com.domine.gestaoti.domain.equipamento.Equipamento;
import br.com.domine.gestaoti.domain.equipamento.EquipamentoRepository;
import br.com.domine.gestaoti.domain.notificacao.NotificacaoService;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.domain.usuario.UsuarioRepository;
import br.com.domine.gestaoti.enums.CategoriaChamado;
import br.com.domine.gestaoti.enums.PerfilUsuario;
import br.com.domine.gestaoti.enums.PrioridadeChamado;
import br.com.domine.gestaoti.enums.StatusChamado;
import br.com.domine.gestaoti.enums.TipoEventoHistorico;
import br.com.domine.gestaoti.enums.TipoNotificacao;
import br.com.domine.gestaoti.exception.BusinessException;
import br.com.domine.gestaoti.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChamadoServiceImpl implements ChamadoService {

    private final ChamadoRepository chamadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final HistoricoChamadoRepository historicoRepository;
    private final ComentarioRepository comentarioRepository;
    private final NotificacaoService notificacaoService;

    @Override
    @Transactional(readOnly = true)
    public Page<ChamadoResponse> listar(StatusChamado status, PrioridadeChamado prioridade,
                                         CategoriaChamado categoria, Long tecnicoId, String busca,
                                         Pageable pageable) {
        Usuario me = SecurityUtils.usuarioAtual();
        Long solicitanteId = me.isAdmin() ? null : me.getId();
        String buscaSan = (busca == null || busca.isBlank()) ? null : busca.trim();
        return chamadoRepository.filtrar(solicitanteId, status, prioridade, categoria, tecnicoId, buscaSan, pageable)
                .map(ChamadoResponse::resumo);
    }

    @Override
    @Transactional(readOnly = true)
    public ChamadoResponse buscarPorId(Long id) {
        Chamado c = buscarComPermissao(id);
        return ChamadoResponse.from(c);
    }

    @Override
    @Transactional
    public ChamadoResponse criar(ChamadoRequest request) {
        Usuario me = SecurityUtils.usuarioAtual();
        Equipamento equipamento = resolverEquipamento(request.equipamentoId());

        Chamado c = Chamado.builder()
                .titulo(request.titulo())
                .descricao(request.descricao())
                .categoria(request.categoria())
                .prioridade(request.prioridade())
                .status(StatusChamado.ABERTO)
                .solicitante(me)
                .equipamento(equipamento)
                .build();
        chamadoRepository.save(c);

        registrarHistorico(c, me, TipoEventoHistorico.CRIADO,
                "Chamado aberto por " + me.getNome());

        // NOVO_CHAMADO → notifica todos os admins ativos, exceto o próprio criador.
        String tituloNotif = "Novo chamado: " + c.getTitulo();
        String descNotif = me.getNome() + " abriu um chamado de prioridade " + c.getPrioridade() + ".";
        usuarioRepository.findByPerfilAndAtivoTrue(PerfilUsuario.ADMIN).forEach(admin -> {
            if (!admin.getId().equals(me.getId())) {
                notificacaoService.enviar(admin, TipoNotificacao.NOVO_CHAMADO, tituloNotif, descNotif, c.getId());
            }
        });

        return ChamadoResponse.from(c);
    }

    @Override
    @Transactional
    public ChamadoResponse atualizar(Long id, ChamadoUpdateRequest request) {
        Usuario me = SecurityUtils.usuarioAtual();
        Chamado c = chamadoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Chamado", id));

        if (me.isAdmin()) {
            c.setTitulo(request.titulo());
            c.setDescricao(request.descricao());
            if (request.categoria() != null) c.setCategoria(request.categoria());
            if (request.prioridade() != null) {
                if (c.getPrioridade() != request.prioridade()) {
                    registrarHistorico(c, me, TipoEventoHistorico.PRIORIDADE_ALTERADA,
                            "Prioridade alterada de " + c.getPrioridade() + " para " + request.prioridade());
                }
                c.setPrioridade(request.prioridade());
            }
            c.setEquipamento(resolverEquipamento(request.equipamentoId()));
        } else {
            if (!c.getSolicitante().getId().equals(me.getId())) {
                throw new AccessDeniedException("Você não tem permissão para editar este chamado");
            }
            if (c.getStatus() != StatusChamado.ABERTO) {
                throw new BusinessException("Só é possível editar chamados em status ABERTO");
            }
            c.setDescricao(request.descricao());
        }

        return ChamadoResponse.from(chamadoRepository.save(c));
    }

    @Override
    @Transactional
    public ChamadoResponse alterarStatus(Long id, StatusUpdateRequest request) {
        Usuario me = SecurityUtils.usuarioAtual();
        Chamado c = chamadoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Chamado", id));

        StatusChamado anterior = c.getStatus();
        if (request.status() == StatusChamado.RESOLVIDO) {
            c.resolver();
        } else {
            c.alterarStatusPara(request.status());
        }
        chamadoRepository.save(c);

        registrarHistorico(c, me, TipoEventoHistorico.STATUS_ALTERADO,
                "Status alterado de " + anterior + " para " + request.status());

        // RESOLVIDO → avisa o solicitante (se não foi ele mesmo).
        if (request.status() == StatusChamado.RESOLVIDO
                && c.getSolicitante() != null
                && !c.getSolicitante().getId().equals(me.getId())) {
            notificacaoService.enviar(
                    c.getSolicitante(),
                    TipoNotificacao.RESOLVIDO,
                    "Chamado #" + c.getId() + " resolvido",
                    me.getNome() + " marcou seu chamado como resolvido.",
                    c.getId()
            );
        }

        return ChamadoResponse.from(c);
    }

    @Override
    @Transactional
    public ChamadoResponse atribuirTecnico(Long id, AtribuirTecnicoRequest request) {
        Usuario me = SecurityUtils.usuarioAtual();
        Chamado c = chamadoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Chamado", id));

        Usuario tecnico = usuarioRepository.findById(request.tecnicoId())
                .orElseThrow(() -> ResourceNotFoundException.of("Usuário", request.tecnicoId()));
        if (!tecnico.isAdmin()) {
            throw new BusinessException("Técnico responsável precisa ter perfil ADMIN");
        }
        c.setTecnicoResponsavel(tecnico);
        chamadoRepository.save(c);

        registrarHistorico(c, me, TipoEventoHistorico.TECNICO_ATRIBUIDO,
                "Técnico " + tecnico.getNome() + " atribuído ao chamado");

        // ATRIBUICAO → notifica o técnico (se não atribuiu a si mesmo).
        if (!tecnico.getId().equals(me.getId())) {
            notificacaoService.enviar(
                    tecnico,
                    TipoNotificacao.ATRIBUICAO,
                    "Chamado #" + c.getId() + " atribuído a você",
                    c.getTitulo(),
                    c.getId()
            );
        }

        return ChamadoResponse.from(c);
    }

    @Override
    @Transactional
    public ComentarioResponse adicionarComentario(Long chamadoId, ComentarioRequest request) {
        Usuario me = SecurityUtils.usuarioAtual();
        Chamado c = chamadoRepository.findById(chamadoId)
                .orElseThrow(() -> ResourceNotFoundException.of("Chamado", chamadoId));

        if (!me.isAdmin() && !c.getSolicitante().getId().equals(me.getId())) {
            throw new AccessDeniedException("Você não pode comentar neste chamado");
        }

        Comentario com = Comentario.builder()
                .chamado(c)
                .autor(me)
                .texto(request.texto())
                .build();
        comentarioRepository.save(com);

        registrarHistorico(c, me, TipoEventoHistorico.COMENTARIO_ADICIONADO,
                me.getNome() + " adicionou um comentário");

        // COMENTARIO → solicitante + técnico responsável, exceto quem comentou.
        String tituloNotif = "Novo comentário no chamado #" + c.getId();
        String descNotif = me.getNome() + ": " + recortar(request.texto(), 120);
        if (c.getSolicitante() != null && !c.getSolicitante().getId().equals(me.getId())) {
            notificacaoService.enviar(c.getSolicitante(), TipoNotificacao.COMENTARIO,
                    tituloNotif, descNotif, c.getId());
        }
        if (c.getTecnicoResponsavel() != null
                && !c.getTecnicoResponsavel().getId().equals(me.getId())
                && (c.getSolicitante() == null
                || !c.getTecnicoResponsavel().getId().equals(c.getSolicitante().getId()))) {
            notificacaoService.enviar(c.getTecnicoResponsavel(), TipoNotificacao.COMENTARIO,
                    tituloNotif, descNotif, c.getId());
        }

        return ComentarioResponse.from(com);
    }

    private static String recortar(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max - 1) + "…";
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistoricoResponse> listarHistorico(Long chamadoId) {
        buscarComPermissao(chamadoId);  // valida acesso
        return historicoRepository.findByChamadoIdOrderByCriadoEmAsc(chamadoId)
                .stream()
                .map(HistoricoResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChamadoResponse> listarPorEquipamento(Long equipamentoId) {
        return chamadoRepository.findByEquipamentoIdOrderByCriadoEmDesc(equipamentoId).stream()
                .map(ChamadoResponse::resumo)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        long abertos = chamadoRepository.countByStatus(StatusChamado.ABERTO);
        long emAtendimento = chamadoRepository.countByStatus(StatusChamado.EM_ATENDIMENTO);
        LocalDateTime inicioMes = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        long resolvidosMes = chamadoRepository.countByStatusAndResolvidoEmAfter(
                StatusChamado.RESOLVIDO, inicioMes);

        Map<String, Long> porPrioridade = inicializarMap(PrioridadeChamado.values());
        for (Object[] linha : chamadoRepository.contarPorPrioridade()) {
            porPrioridade.put(((PrioridadeChamado) linha[0]).name(), (Long) linha[1]);
        }

        Map<String, Long> porCategoria = inicializarMap(CategoriaChamado.values());
        for (Object[] linha : chamadoRepository.contarPorCategoria()) {
            porCategoria.put(((CategoriaChamado) linha[0]).name(), (Long) linha[1]);
        }

        return new DashboardResponse(abertos, emAtendimento, resolvidosMes, porPrioridade, porCategoria);
    }

    // ── helpers ────────────────────────────────────────────────

    private Chamado buscarComPermissao(Long id) {
        Usuario me = SecurityUtils.usuarioAtual();
        Chamado c = chamadoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Chamado", id));
        if (!me.isAdmin() && !c.getSolicitante().getId().equals(me.getId())) {
            throw new AccessDeniedException("Você não tem acesso a este chamado");
        }
        return c;
    }

    private Equipamento resolverEquipamento(Long id) {
        if (id == null) return null;
        return equipamentoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Equipamento", id));
    }

    private void registrarHistorico(Chamado chamado, Usuario autor, TipoEventoHistorico tipo, String descricao) {
        historicoRepository.save(HistoricoChamado.builder()
                .chamado(chamado)
                .autor(autor)
                .tipoEvento(tipo)
                .descricao(descricao)
                .build());
    }

    private <E extends Enum<E>> Map<String, Long> inicializarMap(E[] valores) {
        Map<String, Long> m = new HashMap<>();
        Arrays.stream(valores).forEach(v -> m.put(v.name(), 0L));
        return m;
    }
}
