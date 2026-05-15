package br.com.domine.gestaoti.domain.chamado.dto;

import java.util.Map;

/**
 * Estrutura de dados — uso de {@link Map} para agregações.
 */
public record DashboardResponse(
        long totalAbertos,
        long totalEmAtendimento,
        long totalResolvidosMes,
        Map<String, Long> porPrioridade,
        Map<String, Long> porCategoria
) {}
