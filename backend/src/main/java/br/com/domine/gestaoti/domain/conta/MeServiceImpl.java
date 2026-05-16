package br.com.domine.gestaoti.domain.conta;

import br.com.domine.gestaoti.domain.chamado.ChamadoRepository;
import br.com.domine.gestaoti.domain.chamado.ComentarioRepository;
import br.com.domine.gestaoti.domain.conta.dto.ExcluirContaRequest;
import br.com.domine.gestaoti.domain.conta.dto.ExportacaoDadosResponse;
import br.com.domine.gestaoti.domain.conta.dto.PreExclusaoResponse;
import br.com.domine.gestaoti.domain.notificacao.NotificacaoRepository;
import br.com.domine.gestaoti.domain.sessao.SessaoRepository;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.domain.usuario.UsuarioRepository;
import br.com.domine.gestaoti.enums.PerfilUsuario;
import br.com.domine.gestaoti.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MeServiceImpl implements MeService {

    private final UsuarioRepository usuarioRepository;
    private final ChamadoRepository chamadoRepository;
    private final ComentarioRepository comentarioRepository;
    private final NotificacaoRepository notificacaoRepository;
    private final SessaoRepository sessaoRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public ExportacaoDadosResponse exportarDados(Usuario me) {
        Map<String, Object> perfil = new HashMap<>();
        perfil.put("id", me.getId());
        perfil.put("nome", me.getNome());
        perfil.put("email", me.getEmail());
        perfil.put("telefone", me.getTelefone());
        perfil.put("departamento", me.getDepartamento());
        perfil.put("perfil", me.getPerfil().name());
        perfil.put("ativo", me.getAtivo());
        perfil.put("criadoEm", me.getCriadoEm());
        perfil.put("atualizadoEm", me.getAtualizadoEm());

        List<Map<String, Object>> chamados = chamadoRepository
                .findBySolicitanteIdOrderByCriadoEmDesc(me.getId())
                .stream()
                .map(c -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", c.getId());
                    m.put("titulo", c.getTitulo());
                    m.put("descricao", c.getDescricao());
                    m.put("categoria", c.getCategoria().name());
                    m.put("prioridade", c.getPrioridade().name());
                    m.put("status", c.getStatus().name());
                    m.put("criadoEm", c.getCriadoEm());
                    m.put("resolvidoEm", c.getResolvidoEm());
                    return m;
                })
                .toList();

        List<Map<String, Object>> comentarios = comentarioRepository
                .findByAutorIdOrderByCriadoEmDesc(me.getId())
                .stream()
                .map(c -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", c.getId());
                    m.put("chamadoId", c.getChamado() != null ? c.getChamado().getId() : null);
                    m.put("texto", c.getTexto());
                    m.put("criadoEm", c.getCriadoEm());
                    return m;
                })
                .toList();

        List<Map<String, Object>> notificacoes = notificacaoRepository
                .findByDestinatarioIdOrderByCriadoEmDesc(me.getId(), PageRequest.of(0, 500))
                .stream()
                .map(n -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", n.getId());
                    m.put("tipo", n.getTipo().name());
                    m.put("titulo", n.getTitulo());
                    m.put("descricao", n.getDescricao());
                    m.put("chamadoId", n.getChamadoId());
                    m.put("lida", n.isLida());
                    m.put("criadoEm", n.getCriadoEm());
                    return m;
                })
                .toList();

        return new ExportacaoDadosResponse(LocalDateTime.now(), perfil, chamados, comentarios, notificacoes);
    }

    @Override
    @Transactional(readOnly = true)
    public PreExclusaoResponse infoPreExclusao(Usuario me) {
        if (me.getPerfil() != PerfilUsuario.ADMIN) {
            return new PreExclusaoResponse(false, List.of());
        }
        long outrosAdmins = usuarioRepository.findByPerfilAndAtivoTrue(PerfilUsuario.ADMIN).stream()
                .filter(u -> !u.getId().equals(me.getId()))
                .count();
        if (outrosAdmins > 0) {
            return new PreExclusaoResponse(false, List.of());
        }
        List<PreExclusaoResponse.CandidatoPromocao> candidatos = usuarioRepository
                .findByPerfilAndAtivoTrue(PerfilUsuario.COMUM).stream()
                .map(u -> new PreExclusaoResponse.CandidatoPromocao(u.getId(), u.getNome(), u.getEmail()))
                .toList();
        return new PreExclusaoResponse(true, candidatos);
    }

    @Override
    @Transactional
    public void excluirConta(Usuario me, ExcluirContaRequest request) {
        if (!request.confirmacaoEmail().trim().equalsIgnoreCase(me.getEmail())) {
            throw new BusinessException("O e-mail informado não confere com o da sua conta.");
        }

        if (me.getPerfil() == PerfilUsuario.ADMIN) {
            List<Usuario> adminsAtivos = usuarioRepository.findByPerfilAndAtivoTrue(PerfilUsuario.ADMIN);
            long outrosAdmins = adminsAtivos.stream()
                    .filter(u -> !u.getId().equals(me.getId()))
                    .count();
            if (outrosAdmins == 0) {
                if (request.promoverUsuarioId() == null) {
                    throw new BusinessException(
                            "Você é o único administrador ativo. Promova outro usuário a administrador antes de excluir sua conta."
                    );
                }
                Usuario alvo = usuarioRepository.findById(request.promoverUsuarioId())
                        .orElseThrow(() -> new BusinessException("Usuário a promover não encontrado."));
                if (alvo.getId().equals(me.getId())) {
                    throw new BusinessException("Não é possível promover sua própria conta.");
                }
                if (!Boolean.TRUE.equals(alvo.getAtivo())) {
                    throw new BusinessException("Só é possível promover usuários ativos.");
                }
                alvo.setPerfil(PerfilUsuario.ADMIN);
                usuarioRepository.save(alvo);
            }
        }

        // Anonimiza os dados pessoais mas mantém o registro pra preservar o histórico de
        // chamados/comentários ligados a esse usuário.
        me.setNome("Usuário removido");
        me.setEmail("removido-" + me.getId() + "-" + UUID.randomUUID() + "@deletado.invalido");
        me.setTelefone(null);
        me.setDepartamento(null);
        me.setSenha(passwordEncoder.encode(UUID.randomUUID().toString()));
        me.setAtivo(false);
        usuarioRepository.save(me);

        sessaoRepository.revogarTodasDoUsuario(me.getId(), LocalDateTime.now());
    }
}
