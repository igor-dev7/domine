package br.com.domine.gestaoti.domain.artigo;

import br.com.domine.gestaoti.enums.CategoriaArtigo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtigoRepository extends JpaRepository<Artigo, Long> {

    boolean existsByTitulo(String titulo);

    @Query("""
            SELECT a FROM Artigo a
            WHERE (:categoria IS NULL OR a.categoria = :categoria)
              AND (
                LOWER(a.titulo) LIKE LOWER(CONCAT('%', :busca, '%'))
                OR LOWER(a.resumo) LIKE LOWER(CONCAT('%', :busca, '%'))
              )
            """)
    Page<Artigo> filtrar(
            @Param("categoria") CategoriaArtigo categoria,
            @Param("busca") String busca,
            Pageable pageable
    );

    /**
     * Sugere artigos relevantes via full-text search em português usando
     * to_tsvector com setweight (título A, resumo B, conteúdo C) e ts_rank_cd
     * pra ranquear pelos pesos. Boost extra quando a categoria casa com a
     * do chamado, pra preferir artigos do mesmo domínio quando o score
     * textual empata.
     *
     * Hack: plainto_tsquery faz AND entre termos — restritivo demais pra
     * sugestões em chamados. Convertemos pra OR via replace, garantindo
     * recall amplo (qualquer termo basta pra match); ts_rank_cd cuida da
     * ordenação pelos mais relevantes.
     */
    @Query(nativeQuery = true, value = """
            WITH q AS (
              SELECT to_tsquery(
                'portuguese',
                NULLIF(replace(plainto_tsquery('portuguese', :busca)::text, ' & ', ' | '), '')
              ) AS query
            )
            SELECT a.*
            FROM artigos a, q
            WHERE q.query IS NOT NULL
              AND (
                setweight(to_tsvector('portuguese', coalesce(a.titulo, '')), 'A')
                || setweight(to_tsvector('portuguese', coalesce(a.resumo, '')), 'B')
                || setweight(to_tsvector('portuguese', coalesce(a.conteudo, '')), 'C')
              ) @@ q.query
            ORDER BY
              (CASE WHEN a.categoria = :categoria THEN 1 ELSE 0 END) DESC,
              ts_rank_cd(
                setweight(to_tsvector('portuguese', coalesce(a.titulo, '')), 'A')
                || setweight(to_tsvector('portuguese', coalesce(a.resumo, '')), 'B')
                || setweight(to_tsvector('portuguese', coalesce(a.conteudo, '')), 'C'),
                q.query
              ) DESC
            LIMIT :limite
            """)
    List<Artigo> sugerirPorTexto(
            @Param("busca") String busca,
            @Param("categoria") String categoria,
            @Param("limite") int limite
    );

    /**
     * Fallback quando a busca é vazia: retorna os artigos mais relevantes
     * de uma categoria, priorizando os que mais foram marcados como úteis
     * (peso 3) sobre visualizações.
     */
    @Query(nativeQuery = true, value = """
            SELECT a.*
            FROM artigos a
            WHERE a.categoria = :categoria
            ORDER BY (a.uteis * 3 + a.visualizacoes) DESC, a.criado_em DESC
            LIMIT :limite
            """)
    List<Artigo> topPorCategoria(
            @Param("categoria") String categoria,
            @Param("limite") int limite
    );
}
