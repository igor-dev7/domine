package br.com.domine.gestaoti.domain.artigo;

import br.com.domine.gestaoti.enums.CategoriaArtigo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}
