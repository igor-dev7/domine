package br.com.domine.gestaoti.domain.usuario;

import br.com.domine.gestaoti.domain.usuario.dto.UsuarioRequest;
import br.com.domine.gestaoti.domain.usuario.dto.UsuarioResponse;
import br.com.domine.gestaoti.domain.usuario.dto.UsuarioUpdateRequest;
import br.com.domine.gestaoti.enums.PerfilUsuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UsuarioService {
    Page<UsuarioResponse> listar(String nome, PerfilUsuario perfil, Boolean ativo, Pageable pageable);
    UsuarioResponse buscarPorId(Long id);
    UsuarioResponse buscarAtual();
    UsuarioResponse criar(UsuarioRequest request);
    UsuarioResponse atualizar(Long id, UsuarioUpdateRequest request);
    void desativar(Long id);
}
