package br.com.domine.gestaoti.domain.equipamento.dto;

/**
 * Pode receber `responsavelId = null` para remover o responsável.
 */
public record AlterarResponsavelRequest(Long responsavelId) {}
