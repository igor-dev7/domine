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
import org.springframework.data.domain.Sort;
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

        log.info("DataSeeder: garantindo equipamentos...");
        List<Equipamento> equipamentos = seedEquipamentos(usuarios);

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
        Usuario admin = usuarios.get(0);
        Usuario marina = usuarios.get(1);
        Usuario carlos = usuarios.get(2);
        Usuario joao = usuarios.get(3);

        List<Equipamento> todos = List.of(
                // Notebooks
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
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0006")
                        .tipo(TipoEquipamento.NOTEBOOK)
                        .marca("Apple")
                        .modelo("MacBook Pro 14 M3")
                        .numeroSerie("C02ZW3XYZ1A2")
                        .localizacao("Sala 301 - Diretoria")
                        .status(StatusEquipamento.EM_USO)
                        .responsavel(admin)
                        .dataAquisicao(LocalDate.of(2024, 6, 12))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0007")
                        .tipo(TipoEquipamento.NOTEBOOK)
                        .marca("Apple")
                        .modelo("MacBook Air 13 M2")
                        .numeroSerie("C02XYZA8BC")
                        .localizacao("Estoque TI")
                        .status(StatusEquipamento.ESTOQUE)
                        .dataAquisicao(LocalDate.of(2024, 8, 1))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0008")
                        .tipo(TipoEquipamento.NOTEBOOK)
                        .marca("HP")
                        .modelo("EliteBook 840 G10")
                        .numeroSerie("BR-NB-0008")
                        .localizacao("Sala 110 - RH")
                        .status(StatusEquipamento.EM_USO)
                        .responsavel(joao)
                        .dataAquisicao(LocalDate.of(2024, 1, 22))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0009")
                        .tipo(TipoEquipamento.NOTEBOOK)
                        .marca("Lenovo")
                        .modelo("ThinkPad X1 Carbon Gen 11")
                        .numeroSerie("BR-NB-0009")
                        .localizacao("Estoque TI")
                        .status(StatusEquipamento.ESTOQUE)
                        .dataAquisicao(LocalDate.of(2024, 4, 5))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0010")
                        .tipo(TipoEquipamento.DESKTOP)
                        .marca("Dell")
                        .modelo("OptiPlex 7090")
                        .numeroSerie("BR-DT-0010")
                        .localizacao("Sala 201 - Financeiro")
                        .status(StatusEquipamento.EM_USO)
                        .responsavel(marina)
                        .dataAquisicao(LocalDate.of(2023, 8, 18))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0011")
                        .tipo(TipoEquipamento.MONITOR)
                        .marca("Dell")
                        .modelo("UltraSharp U2723QE")
                        .localizacao("Sala 105 - Comercial")
                        .status(StatusEquipamento.EM_USO)
                        .responsavel(carlos)
                        .dataAquisicao(LocalDate.of(2024, 2, 9))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0012")
                        .tipo(TipoEquipamento.MONITOR)
                        .marca("Samsung")
                        .modelo("Odyssey G5 27\"")
                        .localizacao("Estoque TI")
                        .status(StatusEquipamento.ESTOQUE)
                        .dataAquisicao(LocalDate.of(2025, 1, 14))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0013")
                        .tipo(TipoEquipamento.IMPRESSORA)
                        .marca("HP")
                        .modelo("LaserJet Pro M404dn")
                        .localizacao("Sala 110 - RH")
                        .status(StatusEquipamento.EM_USO)
                        .responsavel(joao)
                        .dataAquisicao(LocalDate.of(2023, 5, 30))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0014")
                        .tipo(TipoEquipamento.CELULAR)
                        .marca("Apple")
                        .modelo("iPhone 14 Pro")
                        .numeroSerie("IMEI-3589-1142")
                        .localizacao("Sala 301 - Diretoria")
                        .status(StatusEquipamento.EM_USO)
                        .responsavel(admin)
                        .dataAquisicao(LocalDate.of(2024, 5, 4))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0015")
                        .tipo(TipoEquipamento.CELULAR)
                        .marca("Xiaomi")
                        .modelo("Redmi Note 12")
                        .localizacao("Estoque TI")
                        .status(StatusEquipamento.ESTOQUE)
                        .dataAquisicao(LocalDate.of(2024, 11, 2))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0016")
                        .tipo(TipoEquipamento.CELULAR)
                        .marca("Motorola")
                        .modelo("Moto G84 5G")
                        .localizacao("Sala 110 - RH")
                        .status(StatusEquipamento.EM_USO)
                        .responsavel(joao)
                        .dataAquisicao(LocalDate.of(2024, 10, 18))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0017")
                        .tipo(TipoEquipamento.PERIFERICO)
                        .marca("Logitech")
                        .modelo("MX Keys Teclado Sem Fio")
                        .localizacao("Sala 105 - Comercial")
                        .status(StatusEquipamento.EM_USO)
                        .responsavel(carlos)
                        .dataAquisicao(LocalDate.of(2024, 3, 28))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0018")
                        .tipo(TipoEquipamento.PERIFERICO)
                        .marca("Logitech")
                        .modelo("MX Master 3S Mouse")
                        .localizacao("Sala 201 - Financeiro")
                        .status(StatusEquipamento.EM_USO)
                        .responsavel(marina)
                        .dataAquisicao(LocalDate.of(2024, 3, 28))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0019")
                        .tipo(TipoEquipamento.PERIFERICO)
                        .marca("Sony")
                        .modelo("WH-1000XM5 Fone Bluetooth")
                        .localizacao("Estoque TI")
                        .status(StatusEquipamento.ESTOQUE)
                        .dataAquisicao(LocalDate.of(2025, 2, 6))
                        .build(),
                Equipamento.builder()
                        .patrimonio("PAT-0020")
                        .tipo(TipoEquipamento.OUTRO)
                        .marca("Western Digital")
                        .modelo("My Passport 2TB")
                        .localizacao("Estoque TI")
                        .status(StatusEquipamento.ESTOQUE)
                        .observacoes("HD externo de backup.")
                        .dataAquisicao(LocalDate.of(2023, 9, 12))
                        .build()
        );

        // Seed idempotente: adiciona apenas os patrimônios que ainda não existem.
        List<Equipamento> novos = todos.stream()
                .filter(e -> !equipamentoRepository.existsByPatrimonio(e.getPatrimonio()))
                .toList();
        if (!novos.isEmpty()) {
            equipamentoRepository.saveAll(novos);
            log.info("DataSeeder: {} equipamentos novos inseridos.", novos.size());
        }
        return equipamentoRepository.findAll(Sort.by("id"));
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
