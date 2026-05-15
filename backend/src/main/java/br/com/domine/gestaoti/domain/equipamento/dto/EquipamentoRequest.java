package br.com.domine.gestaoti.domain.equipamento.dto;

import br.com.domine.gestaoti.enums.StatusEquipamento;
import br.com.domine.gestaoti.enums.TipoEquipamento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EquipamentoRequest(
        @NotBlank @Size(max = 30) String patrimonio,
        @NotNull TipoEquipamento tipo,
        @NotBlank @Size(max = 60) String marca,
        @NotBlank @Size(max = 60) String modelo,
        @Size(max = 60) String numeroSerie,
        @Size(max = 100) String localizacao,
        @NotNull StatusEquipamento status,
        Long responsavelId,
        LocalDate dataAquisicao,
        @Size(max = 500) String observacoes
) {}
