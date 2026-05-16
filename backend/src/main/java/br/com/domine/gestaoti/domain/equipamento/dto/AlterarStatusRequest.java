package br.com.domine.gestaoti.domain.equipamento.dto;

import br.com.domine.gestaoti.enums.StatusEquipamento;
import jakarta.validation.constraints.NotNull;

public record AlterarStatusRequest(@NotNull StatusEquipamento status) {}
