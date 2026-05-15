package br.com.domine.gestaoti.config;

import br.com.domine.gestaoti.domain.chamado.Chamado;
import br.com.domine.gestaoti.domain.chamado.ChamadoRepository;
import br.com.domine.gestaoti.domain.chamado.Comentario;
import br.com.domine.gestaoti.domain.chamado.ComentarioRepository;
import br.com.domine.gestaoti.domain.chamado.HistoricoChamado;
import br.com.domine.gestaoti.domain.chamado.HistoricoChamadoRepository;
import br.com.domine.gestaoti.domain.equipamento.Equipamento;
import br.com.domine.gestaoti.domain.equipamento.EquipamentoRepository;
import br.com.domine.gestaoti.domain.usuario.Usuario;
import br.com.domine.gestaoti.domain.usuario.UsuarioRepository;
import br.com.domine.gestaoti.enums.CategoriaChamado;
import br.com.domine.gestaoti.enums.PerfilUsuario;
import br.com.domine.gestaoti.enums.PrioridadeChamado;
import br.com.domine.gestaoti.enums.StatusChamado;
import br.com.domine.gestaoti.enums.StatusEquipamento;
import br.com.domine.gestaoti.enums.TipoEquipamento;
import br.com.domine.gestaoti.enums.TipoEventoHistorico;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UsuarioRepository usuarioRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final ChamadoRepository chamadoRepository;
    private final ComentarioRepository comentarioRepository;
    private final HistoricoChamadoRepository historicoRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Seed defensivo — cada bloco roda só se sua tabela estiver vazia.
        // Permite estender o seed entre sprints sem precisar resetar o banco.
        List<Usuario> usuarios;
        if (usuarioRepository.count() == 0) {
            log.info("DataSeeder: populando usuários...");
            usuarios = seedUsuarios();
        } else {
            usuarios = usuarioRepository.findAll();
        }

        List<Equipamento> equipamentos;
        if (equipamentoRepository.count() == 0) {
            log.info("DataSeeder: populando equipamentos...");
            equipamentos = seedEquipamentos(usuarios);
        } else {
            equipamentos = equipamentoRepository.findAll();
        }

        if (chamadoRepository.count() == 0) {
            log.info("DataSeeder: populando chamados...");
            seedChamados(usuarios, equipamentos);
        }

        log.info("DataSeeder: seed concluído.");
    }

    private List<Usuario> seedUsuarios() {
        List<Usuario> usuarios = List.of(
                Usuario.builder()
                        .nome("Admin Domine")
                        .email("admin@domine.com.br")
                        .senha(passwordEncoder.encode("admin123"))
                        .perfil(PerfilUsuario.ADMIN)
                        .departamento("TI")
                        .ativo(true)
                        .build(),
                Usuario.builder()
                        .nome("Marina Silva")
                        .email("marina@domine.com.br")
                        .senha(passwordEncoder.encode("senha123"))
                        .perfil(PerfilUsuario.COMUM)
                        .departamento("Financeiro")
                        .ativo(true)
                        .build(),
                Usuario.builder()
                        .nome("Carlos Souza")
                        .email("carlos@domine.com.br")
                        .senha(passwordEncoder.encode("senha123"))
                        .perfil(PerfilUsuario.COMUM)
                        .departamento("Comercial")
                        .ativo(true)
                        .build(),
                Usuario.builder()
                        .nome("João Pereira")
                        .email("joao@domine.com.br")
                        .senha(passwordEncoder.encode("senha123"))
                        .perfil(PerfilUsuario.COMUM)
                        .departamento("RH")
                        .ativo(true)
                        .build()
        );
        return usuarioRepository.saveAll(usuarios);
    }

    private List<Equipamento> seedEquipamentos(List<Usuario> usuarios) {
        Usuario marina = usuarios.get(1);
        Usuario carlos = usuarios.get(2);

        List<Equipamento> equipamentos = List.of(
                Equipamento.builder()
                        .patrimonio("PAT-0001")
                        .tipo(TipoEquipamento.NOTEBOOK)
                        .marca("Dell")
                        .modelo("Latitude 5440")
                        .numeroSerie("BR-NB-0001")
                        .localizacao("Sala 201 - Financeiro")
                        .status(StatusEquipamento.EM_USO)
                        .responsavel(marina)
                        .dataAquisicao(LocalDate.of(2024, 3, 15))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0002")
                        .tipo(TipoEquipamento.DESKTOP)
                        .marca("HP")
                        .modelo("EliteDesk 800")
                        .numeroSerie("BR-DT-0002")
                        .localizacao("Sala 105 - Comercial")
                        .status(StatusEquipamento.EM_USO)
                        .responsavel(carlos)
                        .dataAquisicao(LocalDate.of(2023, 11, 2))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0003")
                        .tipo(TipoEquipamento.MONITOR)
                        .marca("LG")
                        .modelo("24MK430H")
                        .localizacao("Estoque TI")
                        .status(StatusEquipamento.ESTOQUE)
                        .dataAquisicao(LocalDate.of(2024, 7, 1))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0004")
                        .tipo(TipoEquipamento.IMPRESSORA)
                        .marca("Brother")
                        .modelo("HL-L2360DW")
                        .localizacao("Sala 105 - Comercial")
                        .status(StatusEquipamento.MANUTENCAO)
                        .observacoes("Em manutenção externa — driver de fusor")
                        .dataAquisicao(LocalDate.of(2022, 5, 20))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0005")
                        .tipo(TipoEquipamento.CELULAR)
                        .marca("Samsung")
                        .modelo("Galaxy A54")
                        .localizacao("Estoque TI")
                        .status(StatusEquipamento.ESTOQUE)
                        .dataAquisicao(LocalDate.of(2024, 9, 10))
                        .build()
        );
        return equipamentoRepository.saveAll(equipamentos);
    }

    private void seedChamados(List<Usuario> usuarios, List<Equipamento> equipamentos) {
        Usuario admin = usuarios.get(0);
        Usuario marina = usuarios.get(1);
        Usuario carlos = usuarios.get(2);
        Usuario joao = usuarios.get(3);

        Equipamento notebookMarina = equipamentos.get(0);
        Equipamento impressora = equipamentos.get(3);

        // Chamado 1 — ABERTO
        Chamado c1 = chamadoRepository.save(Chamado.builder()
                .titulo("Notebook não conecta no Wi-Fi corporativo")
                .descricao("Desde ontem o notebook não reconhece a rede Domine-Corp. Já tentei reiniciar.")
                .categoria(CategoriaChamado.REDE)
                .prioridade(PrioridadeChamado.MEDIA)
                .status(StatusChamado.ABERTO)
                .solicitante(marina)
                .equipamento(notebookMarina)
                .build());
        historicoRepository.save(HistoricoChamado.builder()
                .chamado(c1).autor(marina).tipoEvento(TipoEventoHistorico.CRIADO)
                .descricao("Chamado aberto por Marina Silva").build());

        // Chamado 2 — EM_ATENDIMENTO com comentários
        Chamado c2 = chamadoRepository.save(Chamado.builder()
                .titulo("Impressora travando ao imprimir lotes grandes")
                .descricao("Quando mandamos imprimir mais de 50 páginas, a impressora trava no meio.")
                .categoria(CategoriaChamado.IMPRESSAO)
                .prioridade(PrioridadeChamado.ALTA)
                .status(StatusChamado.EM_ATENDIMENTO)
                .solicitante(carlos)
                .tecnicoResponsavel(admin)
                .equipamento(impressora)
                .build());
        historicoRepository.save(HistoricoChamado.builder()
                .chamado(c2).autor(carlos).tipoEvento(TipoEventoHistorico.CRIADO)
                .descricao("Chamado aberto por Carlos Souza").build());
        historicoRepository.save(HistoricoChamado.builder()
                .chamado(c2).autor(admin).tipoEvento(TipoEventoHistorico.TECNICO_ATRIBUIDO)
                .descricao("Técnico Admin Domine atribuído ao chamado").build());
        historicoRepository.save(HistoricoChamado.builder()
                .chamado(c2).autor(admin).tipoEvento(TipoEventoHistorico.STATUS_ALTERADO)
                .descricao("Status alterado de ABERTO para EM_ATENDIMENTO").build());
        comentarioRepository.save(Comentario.builder()
                .chamado(c2).autor(admin)
                .texto("Vou enviar a impressora para manutenção externa amanhã.").build());

        // Chamado 3 — AGUARDANDO_USUARIO
        Chamado c3 = chamadoRepository.save(Chamado.builder()
                .titulo("Solicito acesso ao sistema de folha")
                .descricao("Preciso de acesso de leitura ao sistema de folha para fechamento do mês.")
                .categoria(CategoriaChamado.ACESSO)
                .prioridade(PrioridadeChamado.BAIXA)
                .status(StatusChamado.AGUARDANDO_USUARIO)
                .solicitante(joao)
                .tecnicoResponsavel(admin)
                .build());
        historicoRepository.save(HistoricoChamado.builder()
                .chamado(c3).autor(joao).tipoEvento(TipoEventoHistorico.CRIADO)
                .descricao("Chamado aberto por João Pereira").build());
        historicoRepository.save(HistoricoChamado.builder()
                .chamado(c3).autor(admin).tipoEvento(TipoEventoHistorico.STATUS_ALTERADO)
                .descricao("Status alterado para AGUARDANDO_USUARIO — necessário enviar matrícula").build());
        comentarioRepository.save(Comentario.builder()
                .chamado(c3).autor(admin)
                .texto("Por favor, envie sua matrícula e o nome do gestor que aprovou.").build());

        // Chamado 4 — RESOLVIDO
        Chamado c4 = Chamado.builder()
                .titulo("Outlook não sincroniza emails antigos")
                .descricao("Os emails de mais de 30 dias não aparecem mais no Outlook.")
                .categoria(CategoriaChamado.EMAIL)
                .prioridade(PrioridadeChamado.MEDIA)
                .status(StatusChamado.ABERTO)
                .solicitante(marina)
                .tecnicoResponsavel(admin)
                .build();
        c4.resolver();
        c4 = chamadoRepository.save(c4);
        historicoRepository.save(HistoricoChamado.builder()
                .chamado(c4).autor(marina).tipoEvento(TipoEventoHistorico.CRIADO)
                .descricao("Chamado aberto por Marina Silva").build());
        historicoRepository.save(HistoricoChamado.builder()
                .chamado(c4).autor(admin).tipoEvento(TipoEventoHistorico.STATUS_ALTERADO)
                .descricao("Status alterado para RESOLVIDO — cache OST reconstruído").build());
        comentarioRepository.save(Comentario.builder()
                .chamado(c4).autor(admin)
                .texto("Resolvido. Refizemos o cache local do Outlook.").build());
    }
}
