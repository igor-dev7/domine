package br.com.domine.gestaoti.domain.equipamento;

import br.com.domine.gestaoti.domain.EntidadeBase;
import br.com.domine.gestaoti.domain.Notificavel;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.enums.StatusEquipamento;
import br.com.domine.gestaoti.enums.TipoEquipamento;
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

import java.time.LocalDate;

@Entity
@Table(name = "equipamentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipamento extends EntidadeBase implements Notificavel {

    @Column(nullable = false, unique = true, length = 30)
    private String patrimonio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoEquipamento tipo;

    @Column(nullable = false, length = 60)
    private String marca;

    @Column(nullable = false, length = 60)
    private String modelo;

    @Column(length = 60)
    private String numeroSerie;

    @Column(length = 100)
    private String localizacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusEquipamento status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id")
    private Usuario responsavel;

    private LocalDate dataAquisicao;

    @Column(length = 500)
    private String observacoes;

    public void baixar() {
        this.status = StatusEquipamento.BAIXADO;
        this.responsavel = null;
    }

    @Override
    public String gerarMensagemNotificacao() {
        return "Equipamento " + patrimonio + " (" + marca + " " + modelo + ") em status " + status;
    }
}
