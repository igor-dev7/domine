package br.com.domine.gestaoti.domain.artigo;

import br.com.domine.gestaoti.domain.EntidadeBase;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.enums.CategoriaArtigo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "artigos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artigo extends EntidadeBase {

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, length = 300)
    private String resumo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String conteudo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CategoriaArtigo categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id")
    private Usuario autor;

    @Column(nullable = false)
    @Builder.Default
    private Long visualizacoes = 0L;

    @Column(nullable = false)
    @Builder.Default
    private Long uteis = 0L;

    public void incrementarVisualizacao() {
        this.visualizacoes = (this.visualizacoes == null ? 0L : this.visualizacoes) + 1;
    }

    public void incrementarUteis() {
        this.uteis = (this.uteis == null ? 0L : this.uteis) + 1;
    }
}
