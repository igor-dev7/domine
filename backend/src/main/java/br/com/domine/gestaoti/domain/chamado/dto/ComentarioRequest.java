package br.com.domine.gestaoti.domain.chamado.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ComentarioRequest(@NotBlank @Size(min = 1, max = 1000) String texto) {}
