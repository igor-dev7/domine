package br.com.domine.gestaoti.domain.artigo;

import br.com.domine.gestaoti.domain.artigo.dto.ArtigoRequest;
import br.com.domine.gestaoti.domain.artigo.dto.ArtigoResponse;
import br.com.domine.gestaoti.enums.CategoriaArtigo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ArtigoService {
    Page<ArtigoResponse> listar(CategoriaArtigo categoria, String busca, Pageable pageable);
    ArtigoResponse buscarPorId(Long id, boolean registrarVisualizacao);
    ArtigoResponse criar(ArtigoRequest request);
    ArtigoResponse atualizar(Long id, ArtigoRequest request);
    void excluir(Long id);
    ArtigoResponse marcarUtil(Long id);
    java.util.List<ArtigoResponse> sugerir(String busca, CategoriaArtigo categoria, int limite);
}
