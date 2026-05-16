package br.com.domine.gestaoti.domain.usuario;

import br.com.domine.gestaoti.config.SecurityUtils;
import br.com.domine.gestaoti.domain.usuario.dto.UsuarioRequest;
import br.com.domine.gestaoti.domain.usuario.dto.UsuarioResponse;
import br.com.domine.gestaoti.domain.usuario.dto.UsuarioUpdateRequest;
import br.com.domine.gestaoti.enums.PerfilUsuario;
import br.com.domine.gestaoti.exception.BusinessException;
import br.com.domine.gestaoti.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<UsuarioResponse> listar(String nome, PerfilUsuario perfil, Boolean ativo, Pageable pageable) {
        String busca = (nome == null) ? "" : nome.trim();
        return usuarioRepository.filtrar(perfil, ativo, busca, pageable).map(UsuarioResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Usuário", id));
        return UsuarioResponse.from(u);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse buscarAtual() {
        return UsuarioResponse.from(SecurityUtils.usuarioAtual());
    }

    @Override
    @Transactional
    public UsuarioResponse criar(UsuarioRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new BusinessException("Já existe usuário com o email " + request.email());
        }
        Usuario u = Usuario.builder()
                .nome(request.nome())
                .email(request.email())
                .senha(passwordEncoder.encode(request.senha()))
                .telefone(request.telefone())
                .departamento(request.departamento())
                .perfil(request.perfil())
                .ativo(true)
                .build();
        return UsuarioResponse.from(usuarioRepository.save(u));
    }

    @Override
    @Transactional
    public UsuarioResponse atualizar(Long id, UsuarioUpdateRequest request) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Usuário", id));

        if (!u.getEmail().equals(request.email())
                && usuarioRepository.existsByEmail(request.email())) {
            throw new BusinessException("Já existe usuário com o email " + request.email());
        }

        u.setNome(request.nome());
        u.setEmail(request.email());
        u.setTelefone(request.telefone());
        u.setDepartamento(request.departamento());
        if (request.perfil() != null) u.setPerfil(request.perfil());
        if (request.ativo() != null) u.setAtivo(request.ativo());
        return UsuarioResponse.from(usuarioRepository.save(u));
    }

    @Override
    @Transactional
    public void desativar(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Usuário", id));
        u.setAtivo(false);
        usuarioRepository.save(u);
    }
}
