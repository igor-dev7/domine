package br.com.domine.gestaoti.domain.sessao;

import br.com.domine.gestaoti.domain.EntidadeBase;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "sessoes",
        indexes = {
                @Index(name = "idx_sessoes_jti", columnList = "jti", unique = true),
                @Index(name = "idx_sessoes_usuario", columnList = "usuario_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sessao extends EntidadeBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, unique = true, length = 64)
    private String jti;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "ip_origem", length = 64)
    private String ipOrigem;

    @Column(name = "ultimo_acesso_em")
    private LocalDateTime ultimoAcessoEm;

    @Column(name = "revogada_em")
    private LocalDateTime revogadaEm;

    public boolean isAtiva() {
        return revogadaEm == null;
    }
}
