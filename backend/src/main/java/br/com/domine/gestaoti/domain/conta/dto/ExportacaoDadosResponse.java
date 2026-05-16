package br.com.domine.gestaoti.domain.conta.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record ExportacaoDadosResponse(
        LocalDateTime exportadoEm,
        Map<String, Object> perfil,
        List<Map<String, Object>> chamadosAbertos,
        List<Map<String, Object>> comentarios,
        List<Map<String, Object>> notificacoes
) {}
