package br.com.domine.gestaoti.domain.usuario;

import br.com.domine.gestaoti.enums.PerfilUsuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Usuario> findByPerfilAndAtivoTrue(PerfilUsuario perfil);

    @Query("""
            SELECT u FROM Usuario u
            WHERE (:perfil IS NULL OR u.perfil = :perfil)
              AND (:ativo IS NULL OR u.ativo = :ativo)
              AND (:busca = ''
                   OR LOWER(u.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :busca, '%')))
            ORDER BY u.nome ASC
            """)
    Page<Usuario> filtrar(
            @Param("perfil") PerfilUsuario perfil,
            @Param("ativo") Boolean ativo,
            @Param("busca") String busca,
            Pageable pageable
    );
}
