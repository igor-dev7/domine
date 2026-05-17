package br.com.domine.gestaoti.domain.artigo;

import br.com.domine.gestaoti.config.SecurityUtils;
import br.com.domine.gestaoti.domain.artigo.dto.ArtigoRequest;
import br.com.domine.gestaoti.domain.artigo.dto.ArtigoResponse;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.enums.CategoriaArtigo;
import br.com.domine.gestaoti.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ArtigoServiceImpl implements ArtigoService {

    private final ArtigoRepository artigoRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ArtigoResponse> listar(CategoriaArtigo categoria, String busca, Pageable pageable) {
        String buscaFilter = (busca == null) ? "" : busca;
        return artigoRepository.filtrar(categoria, buscaFilter, pageable)
                .map(ArtigoResponse::from);
    }

    @Override
    @Transactional
    public ArtigoResponse buscarPorId(Long id, boolean registrarVisualizacao) {
        Artigo a = artigoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Artigo", id));
        if (registrarVisualizacao) {
            a.incrementarVisualizacao();
            a = artigoRepository.save(a);
        }
        return ArtigoResponse.from(a);
    }

    @Override
    @Transactional
    public ArtigoResponse criar(ArtigoRequest request) {
        Usuario autor = autorAtualOuNull();
        Artigo a = Artigo.builder()
                .titulo(request.titulo())
                .resumo(request.resumo())
                .conteudo(request.conteudo())
                .categoria(request.categoria())
                .autor(autor)
                .visualizacoes(0L)
                .uteis(0L)
                .build();
        a = artigoRepository.save(a);
        return ArtigoResponse.from(a);
    }

    @Override
    @Transactional
    public ArtigoResponse atualizar(Long id, ArtigoRequest request) {
        Artigo a = artigoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Artigo", id));
        a.setTitulo(request.titulo());
        a.setResumo(request.resumo());
        a.setConteudo(request.conteudo());
        a.setCategoria(request.categoria());
        a = artigoRepository.save(a);
        return ArtigoResponse.from(a);
    }

    @Override
    @Transactional
    public void excluir(Long id) {
        if (!artigoRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Artigo", id);
        }
        artigoRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ArtigoResponse marcarUtil(Long id) {
        Artigo a = artigoRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Artigo", id));
        a.incrementarUteis();
        a = artigoRepository.save(a);
        return ArtigoResponse.from(a);
    }

    private Usuario autorAtualOuNull() {
        try {
            return SecurityUtils.usuarioAtual();
        } catch (Exception ignored) {
            return null;
        }
    }
}
