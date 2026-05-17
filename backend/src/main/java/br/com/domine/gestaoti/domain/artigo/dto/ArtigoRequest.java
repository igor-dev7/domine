package br.com.domine.gestaoti.domain.artigo.dto;

import br.com.domine.gestaoti.enums.CategoriaArtigo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ArtigoRequest(
        @NotBlank @Size(min = 5, max = 150) String titulo,
        @NotBlank @Size(min = 10, max = 300) String resumo,
        @NotBlank @Size(min = 10, max = 10000) String conteudo,
        @NotNull CategoriaArtigo categoria
) {}
