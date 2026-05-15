package br.com.domine.gestaoti.domain;

/**
 * POO — Abstração + Polimorfismo.
 * Cada implementação (Chamado, Equipamento) decide como gerar
 * sua própria mensagem de notificação. Permite tratar tipos
 * heterogêneos como uma única coleção via List<Notificavel>.
 */
public interface Notificavel {
    String gerarMensagemNotificacao();
}
