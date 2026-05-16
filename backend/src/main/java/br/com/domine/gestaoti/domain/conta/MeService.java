package br.com.domine.gestaoti.domain.conta;

import br.com.domine.gestaoti.domain.conta.dto.ExcluirContaRequest;
import br.com.domine.gestaoti.domain.conta.dto.ExportacaoDadosResponse;
import br.com.domine.gestaoti.domain.conta.dto.PreExclusaoResponse;
import br.com.domine.gestaoti.domain.usuario.Usuario;

public interface MeService {

    ExportacaoDadosResponse exportarDados(Usuario me);

    PreExclusaoResponse infoPreExclusao(Usuario me);

    void excluirConta(Usuario me, ExcluirContaRequest request);
}
