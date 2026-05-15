package br.com.domine.gestaoti.domain.chamado;

import br.com.domine.gestaoti.domain.EntidadeBase;
import br.com.domine.gestaoti.domain.Notificavel;
import br.com.domine.gestaoti.domain.equipamento.Equipamento;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.enums.CategoriaChamado;
import br.com.domine.gestaoti.enums.PrioridadeChamado;
import br.com.domine.gestaoti.enums.StatusChamado;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chamados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chamado extends EntidadeBase implements Notificavel {

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CategoriaChamado categoria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PrioridadeChamado prioridade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusChamado status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitante_id", nullable = false)
    private Usuario solicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_responsavel_id")
    private Usuario tecnicoResponsavel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipamento_id")
    private Equipamento equipamento;

    private LocalDateTime resolvidoEm;

    @OneToMany(mappedBy = "chamado", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("criadoEm ASC")
    @Builder.Default
    private List<Comentario> comentarios = new ArrayList<>();

    /** POO — Encapsulamento: lógica de domínio na entidade. */
    public void resolver() {
        this.status = StatusChamado.RESOLVIDO;
        this.resolvidoEm = LocalDateTime.now();
    }

    public void alterarStatusPara(StatusChamado novoStatus) {
        this.status = novoStatus;
        if (novoStatus == StatusChamado.RESOLVIDO && this.resolvidoEm == null) {
            this.resolvidoEm = LocalDateTime.now();
        }
    }

    @Override
    public String gerarMensagemNotificacao() {
        return "Chamado #" + getId() + " (" + titulo + ") em status " + status + " com prioridade " + prioridade;
    }
}
