package br.com.domine.gestaoti.config;

import br.com.domine.gestaoti.domain.artigo.Artigo;
import br.com.domine.gestaoti.domain.artigo.ArtigoRepository;
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
import br.com.domine.gestaoti.enums.CategoriaArtigo;
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
    private final ArtigoRepository artigoRepository;
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

        log.info("DataSeeder: garantindo artigos da base de conhecimento...");
        seedArtigos(usuarios);

        log.info("DataSeeder: seed concluído.");
    }

    private void seedArtigos(List<Usuario> usuarios) {
        Usuario admin = usuarios.get(0);

        List<Artigo> artigos = List.of(
                Artigo.builder()
                        .titulo("Como resetar a senha do Wi-Fi corporativo")
                        .resumo("Passo a passo pra trocar a senha do roteador principal sem derrubar a rede do escritório. Inclui janela de manutenção sugerida.")
                        .conteudo("""
# Reset de senha Wi-Fi corporativo

## Pré-requisitos
- Acesso administrativo ao painel do roteador (10.0.0.1)
- Janela de manutenção agendada (idealmente fora do horário comercial)

## Passos
1. Avise os usuários no canal #ti-avisos com 24h de antecedência
2. Acesse o painel admin do roteador
3. Vá em Wireless → Security → WPA2
4. Atualize a chave compartilhada (mínimo 16 caracteres)
5. Documente a nova chave no cofre 1Password (vault TI)
6. Comunique a nova senha pelos canais oficiais

## Rollback
Se a nova senha causar problemas, reverta pelo backup automático do roteador.
""")
                        .categoria(CategoriaArtigo.REDE)
                        .autor(admin)
                        .visualizacoes(312L)
                        .uteis(47L)
                        .build(),
                Artigo.builder()
                        .titulo("Instalação do Microsoft Office via portal corporativo")
                        .resumo("Procedimento oficial pra novos colaboradores instalarem o pacote Office com a licença do plano Microsoft 365 da empresa.")
                        .conteudo("""
# Instalação Microsoft Office 365

## Passos
1. Acesse https://portal.office.com com seu e-mail corporativo
2. Clique em "Instalar Office" → "Aplicativos do Office 365"
3. Execute o instalador baixado
4. Faça login novamente quando solicitado
5. Aguarde a instalação completar (~10 minutos)

## Validação
- Abra o Word e verifique se aparece seu nome no canto superior direito
- Crie um documento de teste para confirmar que está salvando no OneDrive

## Problemas comuns
- **"Não foi possível ativar"**: verifique se há instalação anterior pessoal e desinstale primeiro
- **Travamento na instalação**: pause antivírus durante o processo
""")
                        .categoria(CategoriaArtigo.SOFTWARE)
                        .autor(admin)
                        .visualizacoes(264L)
                        .uteis(38L)
                        .build(),
                Artigo.builder()
                        .titulo("Solicitação de acesso a sistemas internos")
                        .resumo("Fluxo de aprovação pra liberar acesso a ERP, CRM e ferramentas restritas. Inclui matriz RACI e SLA típico de 1 dia útil.")
                        .conteudo("""
# Solicitação de acesso

## Fluxo
1. Abra um chamado da categoria **ACESSO** descrevendo qual sistema e nível de permissão
2. Inclua o nome do gestor aprovador
3. TI valida com o gestor (~4h úteis)
4. Após aprovação, acesso é provisionado em até 1 dia útil

## SLA
- Aprovação: até 4 horas úteis
- Provisionamento: até 1 dia útil

## Matriz RACI
| Papel        | Responsabilidade         |
|--------------|--------------------------|
| Solicitante  | Abre chamado + justifica |
| Gestor       | Aprova ou nega           |
| TI           | Provisiona acesso        |
| Compliance   | Audita trimestralmente   |
""")
                        .categoria(CategoriaArtigo.ACESSO)
                        .autor(admin)
                        .visualizacoes(189L)
                        .uteis(29L)
                        .build(),
                Artigo.builder()
                        .titulo("Diagnóstico de problemas comuns no notebook Dell Latitude")
                        .resumo("Checklist rápido pra triagem antes de abrir chamado: bateria, drivers, ventilação e indicadores de hardware.")
                        .conteudo("""
# Diagnóstico Dell Latitude

## Checklist rápido
- [ ] LED de carga aceso ao conectar fonte?
- [ ] Sons da ventoinha audíveis ao ligar?
- [ ] Tela com brilho normal (testar Fn+F11/F12)?
- [ ] Teclas Caps Lock e Num Lock acendem?

## Diagnóstico de hardware integrado
1. Reinicie o notebook
2. Pressione **F12** repetidamente na tela do logo
3. Selecione "Diagnostics" no menu
4. Execute o teste rápido (~5 min)
5. Anote qualquer código de erro retornado

## Quando abrir chamado
Se o diagnóstico retornar erro ou se algum item do checklist falhar, abra chamado HARDWARE com o código do erro no título.
""")
                        .categoria(CategoriaArtigo.HARDWARE)
                        .autor(admin)
                        .visualizacoes(152L)
                        .uteis(22L)
                        .build(),
                Artigo.builder()
                        .titulo("Configuração de e-mail corporativo no celular pessoal")
                        .resumo("Tutorial passo a passo pra Android e iOS, com aplicação de perfil MDM e ativação de PIN obrigatório.")
                        .conteudo("""
# E-mail corporativo no celular

## iOS
1. Configurações → Mail → Contas → Adicionar conta
2. Escolha "Microsoft Exchange"
3. E-mail: seu.email@domine.com.br
4. Aceite o perfil MDM quando solicitado
5. Defina um PIN de 6 dígitos quando pedido

## Android
1. Baixe o Outlook na Play Store
2. Adicione sua conta corporativa
3. Aceite as permissões do Intune
4. Defina PIN de 6 dígitos

## Observações importantes
- O PIN é obrigatório por política de segurança
- O dispositivo pode ser limpo remotamente em caso de perda
""")
                        .categoria(CategoriaArtigo.SOFTWARE)
                        .autor(admin)
                        .visualizacoes(198L)
                        .uteis(31L)
                        .build(),
                Artigo.builder()
                        .titulo("O que fazer se sua impressora não imprime")
                        .resumo("Lista de causas comuns (driver, fila travada, IP duplicado) e como resolver antes de abrir chamado pra TI.")
                        .conteudo("""
# Impressora não imprime

## Antes de abrir chamado, tente
1. **Verifique a fila**: Configurações → Impressoras → clique direito → "Ver fila"
2. **Limpe a fila**: cancele todos os trabalhos travados
3. **Reinicie o serviço Spooler**: services.msc → "Spooler de Impressão" → Reiniciar
4. **Teste ping**: `ping IP-DA-IMPRESSORA` no cmd
5. **Reinstale o driver**: remova a impressora e adicione novamente pelo IP

## Causas mais comuns
- **Fila travada por documento corrompido** (60% dos casos)
- **IP conflitando com outro dispositivo** (20%)
- **Driver desatualizado após Windows Update** (15%)
- **Cabo de rede solto** (5%)

Se nada funcionar, abra chamado HARDWARE com o resultado do ping e o nome da impressora.
""")
                        .categoria(CategoriaArtigo.HARDWARE)
                        .autor(admin)
                        .visualizacoes(174L)
                        .uteis(28L)
                        .build(),
                Artigo.builder()
                        .titulo("Boas práticas de segurança da informação")
                        .resumo("Política da empresa: senhas, 2FA, dispositivos pessoais, phishing e canais de denúncia.")
                        .conteudo("""
# Segurança da informação

## Senhas
- Mínimo 12 caracteres
- Nunca reutilize entre sistemas
- Use o 1Password (vault TI)
- Troque a cada 90 dias

## 2FA obrigatório
Todos os sistemas críticos exigem 2FA. Use o Microsoft Authenticator no celular corporativo.

## Phishing
- Desconfie de e-mails pedindo senha ou dados bancários
- Reporte para `seguranca@domine.com.br` ao menor sinal
- Em dúvida, NÃO clique — pergunte primeiro

## Canais de denúncia
- E-mail: `seguranca@domine.com.br`
- Slack: #seguranca
- Anônimo: hotline 0800-XXX-XXXX
""")
                        .categoria(CategoriaArtigo.OUTROS)
                        .autor(admin)
                        .visualizacoes(421L)
                        .uteis(67L)
                        .build(),
                Artigo.builder()
                        .titulo("VPN corporativa: instalação e troubleshooting")
                        .resumo("Como instalar o cliente VPN, configurar perfil e resolver os erros mais comuns (timeout, DNS, certificado expirado).")
                        .conteudo("""
# VPN corporativa

## Instalação
1. Baixe o cliente em https://vpn.domine.com.br/download
2. Execute o instalador (requer admin local)
3. Abra o cliente → Importar perfil → use o arquivo enviado por e-mail
4. Login: usuário corporativo + 2FA

## Erros comuns

### Timeout ao conectar
- Verifique se está em rede que não bloqueia UDP 1194
- Tente alternar entre TCP e UDP nas configurações

### DNS não resolve nomes internos
- Reinicie o serviço: `ipconfig /flushdns`
- Verifique se o perfil tem DNS interno configurado

### Certificado expirado
- Solicite renovação abrindo chamado ACESSO
- TI renova em até 1 dia útil
""")
                        .categoria(CategoriaArtigo.REDE)
                        .autor(admin)
                        .visualizacoes(245L)
                        .uteis(35L)
                        .build(),

                // ── HARDWARE ─────────────────────────────────────────────
                Artigo.builder()
                        .titulo("Como trocar o teclado de um notebook Lenovo ThinkPad")
                        .resumo("Procedimento físico passo a passo pra substituir o teclado de um ThinkPad sem danificar o flat cable nem perder parafusos.")
                        .conteudo("""
# Troca de teclado ThinkPad

## Ferramentas
- Chave Phillips PH0 e PH1
- Espátula plástica
- Bandeja imantada para parafusos
- Pulseira antiestática

## Passos
1. Desligue e remova a bateria (se removível)
2. Solte os parafusos marcados com símbolo de teclado na tampa inferior
3. Empurre o teclado pela borda superior até soltar
4. Vire com cuidado — há um flat cable curto conectado à placa
5. Solte a trava do conector ZIF antes de puxar o flat
6. Posicione o teclado novo, conecte o flat e trave o ZIF
7. Encaixe e parafuse novamente

## Validação
Ligue e teste cada tecla com `keyboardchecker.com`. Pressione Fn+F11/F12 pra confirmar teclas de função.

## Cuidados
- Nunca force o teclado pra cima — pode rasgar o flat
- Anote a posição de cada parafuso, alguns têm comprimentos diferentes
""")
                        .categoria(CategoriaArtigo.HARDWARE)
                        .autor(admin)
                        .visualizacoes(82L)
                        .uteis(14L)
                        .build(),
                Artigo.builder()
                        .titulo("Manutenção preventiva trimestral em desktops")
                        .resumo("Checklist do procedimento de limpeza interna, troca de pasta térmica e diagnóstico de ventoinhas que rodamos a cada 3 meses.")
                        .conteudo("""
# Manutenção preventiva — desktops

## Frequência
A cada 3 meses, conforme calendário do RH (#manutencao-ti).

## Checklist físico
- [ ] Desligar e desconectar todos os cabos
- [ ] Abrir lateral e fotografar disposição interna
- [ ] Soprar ar comprimido em ventoinhas e dissipadores
- [ ] Verificar se ventoinhas giram livremente (sem ruído)
- [ ] Trocar pasta térmica do CPU (se temperatura > 70°C em idle)
- [ ] Conferir capacitores estufados ou vazando
- [ ] Verificar firmeza dos cabos SATA e da alimentação

## Checklist software
- [ ] Atualizar BIOS (se nova versão estável)
- [ ] Rodar `chkdsk /f` no disco do sistema
- [ ] Verificar SMART do disco (CrystalDiskInfo)
- [ ] Atualizar drivers de chipset e GPU

## Documentação
Registrar no chamado de manutenção:
- Patrimônio
- Data
- Item trocado (se houver)
- Foto antes/depois
""")
                        .categoria(CategoriaArtigo.HARDWARE)
                        .autor(admin)
                        .visualizacoes(67L)
                        .uteis(11L)
                        .build(),
                Artigo.builder()
                        .titulo("Monitor sem sinal — diagnóstico rápido")
                        .resumo("Fluxo de eliminação pra descobrir se o problema é cabo, fonte, GPU ou o próprio monitor — em menos de 5 minutos.")
                        .conteudo("""
# Monitor sem sinal

## Fluxo de eliminação
1. **LED do monitor aceso?**
   - Não → é fonte. Troque o cabo de força e teste em outra tomada.
   - Sim → próximo passo.

2. **Mensagem "Sem sinal" aparece?**
   - Sim → monitor funciona. Problema é cabo de vídeo ou GPU.
   - Não → monitor pode estar com defeito. Teste em outra máquina.

3. **Cabo de vídeo**
   - Troque por outro HDMI/DisplayPort
   - Teste outra porta de saída na GPU
   - Se o PC tiver iGPU, conecte direto na placa-mãe

4. **GPU**
   - Reassente a placa
   - Verifique conectores de alimentação PCIe
   - Teste com outra GPU se disponível

## Quando trocar o monitor
Se passou em todos os testes acima e ainda não funciona, abra chamado HARDWARE com a marca/modelo e os passos já tentados.
""")
                        .categoria(CategoriaArtigo.HARDWARE)
                        .autor(admin)
                        .visualizacoes(124L)
                        .uteis(19L)
                        .build(),

                // ── SOFTWARE ─────────────────────────────────────────────
                Artigo.builder()
                        .titulo("Instalação e configuração do Slack corporativo")
                        .resumo("Como instalar o Slack desktop, fazer login no workspace `domine.slack.com` e configurar canais essenciais pra primeiro dia.")
                        .conteudo("""
# Slack — primeiro dia

## Instalação
1. Baixe em https://slack.com/downloads
2. Execute o instalador
3. No primeiro abrir, escolha "Entrar em um workspace"
4. Workspace URL: `domine.slack.com`
5. Use seu e-mail corporativo
6. Confirme via link enviado por e-mail

## Canais essenciais (entre em todos)
- `#geral` — comunicados gerais
- `#ti-avisos` — manutenções e indisponibilidades
- `#seu-time` — peça pro gestor adicionar

## Configurações recomendadas
- Notificações: apenas menções e DMs (Preferências → Notificações)
- Modo escuro: Preferências → Tema → Escuro
- Status de "Em reunião" automático: integração com Calendar

## Etiqueta
- Use threads para discussões longas
- Reaja com emoji 👀 quando ver, ✅ quando concluído
- Evite mensagens diretas para perguntas técnicas — use canais
""")
                        .categoria(CategoriaArtigo.SOFTWARE)
                        .autor(admin)
                        .visualizacoes(156L)
                        .uteis(24L)
                        .build(),
                Artigo.builder()
                        .titulo("Como usar o 1Password corporativo")
                        .resumo("Vault TI, compartilhamento seguro de credenciais, geração de senhas fortes e integração com browser e celular.")
                        .conteudo("""
# 1Password — guia rápido

## Setup inicial
1. Aceite o convite recebido no e-mail corporativo
2. Defina sua Master Password (anote em local físico seguro)
3. Imprima o Emergency Kit — guarde em gaveta trancada
4. Instale extensão no browser (Chrome/Firefox/Edge)
5. Instale o app no celular

## Estrutura de vaults
- **Pessoal** — suas senhas pessoais (não compartilhadas)
- **TI Operações** — credenciais de infra (acesso restrito)
- **Equipe X** — credenciais compartilhadas com seu time

## Boas práticas
- Sempre use o gerador de senha (16+ chars, especiais)
- Nunca copie senha — use o autofill da extensão
- Para compartilhar com colega: use "Compartilhar item" (link com expiração)
- Ative 2FA na própria conta 1Password

## Esqueci a Master Password
Procure imediatamente o time TI. Sem ela e sem o Emergency Kit, NÃO há recuperação — é por design.
""")
                        .categoria(CategoriaArtigo.SOFTWARE)
                        .autor(admin)
                        .visualizacoes(203L)
                        .uteis(41L)
                        .build(),
                Artigo.builder()
                        .titulo("Atualização do Windows — janela de manutenção")
                        .resumo("Como agendar atualizações pra fora do horário comercial e evitar surpresas no meio de uma apresentação.")
                        .conteudo("""
# Windows Update — janela de manutenção

## Por que isso importa
Atualizações no meio do expediente travam o usuário por 15-30 min. Pra evitar, configure a janela:

## Configuração
1. Configurações → Windows Update → Opções avançadas
2. "Horários ativos" → defina das 08h às 19h
3. Marque "Notificar antes de reiniciar"

## Política corporativa
- Atualizações críticas de segurança: instaladas em até 7 dias
- Atualizações cumulativas mensais: até 30 dias
- Feature updates (versão major): após validação TI (~60 dias)

## Forçar atualização manual
```
Win + R → "ms-settings:windowsupdate" → "Verificar atualizações"
```

## Problemas comuns
- **"Não foi possível instalar"**: rode `sfc /scannow` como admin
- **Loop de reinicialização**: abra chamado HARDWARE urgente
- **Espaço insuficiente**: limpe %temp% e Windows.old
""")
                        .categoria(CategoriaArtigo.SOFTWARE)
                        .autor(admin)
                        .visualizacoes(94L)
                        .uteis(13L)
                        .build(),

                // ── REDE ──────────────────────────────────────────────────
                Artigo.builder()
                        .titulo("Configuração de proxy corporativo no navegador")
                        .resumo("Setup do proxy `proxy.domine.com.br:8080` no Chrome, Firefox e Edge — necessário pra acessar sistemas internos de fora do escritório.")
                        .conteudo("""
# Proxy corporativo

## Endereço
`proxy.domine.com.br:8080` (HTTP e HTTPS)

## Chrome / Edge
1. Configurações → Sistema → Abrir configurações de proxy do sistema
2. Marque "Usar servidor proxy"
3. Endereço: `proxy.domine.com.br` | Porta: `8080`
4. Marque "Não usar proxy para localhost"

## Firefox
1. Configurações → Geral → role até "Configurações de rede"
2. Configuração manual de proxy
3. HTTP/HTTPS: `proxy.domine.com.br` | Porta: `8080`
4. Sem proxy para: `localhost, 127.0.0.1, *.domine.com.br`

## Autenticação
Solicita usuário e senha corporativos na primeira requisição. Marque "Lembrar".

## Quando NÃO usar
- Conectado na rede do escritório (já passa pelo proxy transparente)
- Em VPN corporativa (idem)

Em dúvida, abra chamado REDE.
""")
                        .categoria(CategoriaArtigo.REDE)
                        .autor(admin)
                        .visualizacoes(143L)
                        .uteis(22L)
                        .build(),
                Artigo.builder()
                        .titulo("Internet lenta — checklist antes de abrir chamado")
                        .resumo("Speed test, troca de canal Wi-Fi, conferência de cabo e diagnóstico de DNS — 90% dos chamados são resolvidos aqui.")
                        .conteudo("""
# Internet lenta — diagnóstico

## Antes de tudo
Rode um speed test em https://fast.com pra ter número objetivo. Sem isso, qualquer chamado vira "está lenta".

## Wi-Fi
- Aproxime-se do roteador
- Troque de banda: 2.4GHz (mais alcance) ↔ 5GHz (mais velocidade)
- Reinicie o adaptador Wi-Fi: Painel de Controle → Conexões → Desabilitar/Habilitar
- Teste em outro dispositivo: problema é seu device ou a rede?

## Cabo
- Teste outro cabo (cabos antigos limitam a 100Mbps)
- Troque a porta do switch
- Verifique LED do switch — amarelo = 100Mbps, verde = 1Gbps

## DNS
- Teste DNS público: `1.1.1.1` (Cloudflare) ou `8.8.8.8` (Google)
- Limpe cache: `ipconfig /flushdns`

## Anote no chamado
1. Resultado do speed test (download/upload/ping)
2. Wi-Fi ou cabo
3. Mesmo problema em outro dispositivo?
4. Horário em que começou
""")
                        .categoria(CategoriaArtigo.REDE)
                        .autor(admin)
                        .visualizacoes(287L)
                        .uteis(53L)
                        .build(),

                // ── ACESSO ────────────────────────────────────────────────
                Artigo.builder()
                        .titulo("Reset de senha do AD corporativo")
                        .resumo("Como trocar a senha do domínio Windows, requisitos de complexidade e o que fazer quando a conta fica bloqueada.")
                        .conteudo("""
# Reset de senha — Active Directory

## Auto-serviço (recomendado)
1. Acesse https://senha.domine.com.br
2. Informe seu e-mail corporativo
3. Receba código por SMS (cadastrado no RH)
4. Defina nova senha respeitando os requisitos

## Requisitos de senha
- Mínimo 12 caracteres
- Pelo menos 1 maiúscula, 1 minúscula, 1 número e 1 especial
- Não pode conter seu nome ou as 5 últimas senhas
- Não expira (política antiga abolida em 2024)

## Conta bloqueada
Após 5 tentativas erradas, conta bloqueia por 30 minutos automaticamente.
- Aguarde 30 min OU
- Abra chamado ACESSO pra desbloqueio imediato

## Trocar senha logado no Windows
`Ctrl+Alt+Del` → "Alterar senha"

## Sincronização
A nova senha vale imediatamente em todos os sistemas com SSO. Para sistemas sem SSO, troque individualmente.
""")
                        .categoria(CategoriaArtigo.ACESSO)
                        .autor(admin)
                        .visualizacoes(412L)
                        .uteis(78L)
                        .build(),
                Artigo.builder()
                        .titulo("Pedido de acesso temporário para terceiros")
                        .resumo("Fluxo pra conceder acesso por tempo limitado a consultores, auditores e prestadores — com expiração automática.")
                        .conteudo("""
# Acesso temporário para terceiros

## Quem pode pedir
Gestores e líderes de área, com aprovação do diretor responsável.

## Informações necessárias
- Nome completo do terceiro
- CPF e e-mail
- Empresa contratada
- Sistemas que precisa acessar
- Data de início e fim (máximo 90 dias)
- Justificativa de negócio

## Fluxo
1. Abrir chamado ACESSO com as informações acima
2. TI valida com o gestor (24h úteis)
3. Conta é criada com expiração automática
4. Terceiro recebe credenciais por e-mail criptografado
5. No D-7 da expiração, gestor recebe lembrete

## Após expiração
Conta é desativada automaticamente. Histórico fica registrado pra auditoria por 5 anos.

## Renovação
Abra novo chamado citando o número do anterior. Não há renovação automática.
""")
                        .categoria(CategoriaArtigo.ACESSO)
                        .autor(admin)
                        .visualizacoes(89L)
                        .uteis(15L)
                        .build(),
                Artigo.builder()
                        .titulo("MFA — configuração do Microsoft Authenticator")
                        .resumo("Passo a passo pra registrar o segundo fator de autenticação no celular corporativo e configurar backup.")
                        .conteudo("""
# MFA — Microsoft Authenticator

## Instalação
1. Baixe o app na Play Store / App Store: "Microsoft Authenticator"
2. Abra o app, aceite os termos
3. Acesse https://aka.ms/mfasetup no computador
4. Faça login com sua conta corporativa
5. Clique em "Adicionar método" → "App autenticador"
6. Escaneie o QR Code com o Authenticator

## Backup (IMPORTANTE)
1. No Authenticator: Configurações → Backup
2. Ative "Backup na nuvem"
3. Use sua conta Microsoft pessoal pra backup
4. Anote a conta usada em local físico seguro

## Troquei de celular, e agora?
- **Com backup ativo**: instale Authenticator no novo, faça login na sua conta MS pessoal, restaure
- **Sem backup**: abra chamado ACESSO urgente — TI reseta MFA e você reconfigura

## Quando o MFA é solicitado
- Login em sistemas corporativos
- Acesso ao VPN
- Operações sensíveis (mudança de senha, etc.)
""")
                        .categoria(CategoriaArtigo.ACESSO)
                        .autor(admin)
                        .visualizacoes(178L)
                        .uteis(34L)
                        .build(),

                // ── OUTROS ────────────────────────────────────────────────
                Artigo.builder()
                        .titulo("Como identificar e reportar phishing")
                        .resumo("Sinais clássicos de e-mails maliciosos, fluxo de denúncia interna e o que fazer se você clicou por engano.")
                        .conteudo("""
# Phishing — identificação e resposta

## Sinais clássicos
- Remetente parecido mas com 1 letra trocada (`microsft.com`)
- Urgência forçada ("sua conta será bloqueada em 24h")
- Links que mostram um endereço mas apontam pra outro (passe o mouse antes de clicar)
- Pedidos de dados bancários, senhas ou códigos MFA
- Anexos `.zip`, `.exe`, `.iso` inesperados
- Saudação genérica ("Caro usuário") em vez do seu nome

## O que fazer ao receber
1. **NÃO clique em nada**
2. Encaminhe para `phishing@domine.com.br`
3. Marque como spam/lixo eletrônico
4. Avise seu time pelo Slack se for ataque dirigido

## Cliquei sem querer, e agora?
1. **Desconecte o cabo de rede** imediatamente (ou desligue Wi-Fi)
2. Ligue para o ramal de Segurança da Informação: 4000
3. Não tente "limpar" sozinho — equipe de SI faz triagem
4. Anote tudo que clicou/digitou pra investigação

## Lembre-se
TI **nunca** vai pedir sua senha por e-mail, telefone ou Slack. Se alguém pedir, é golpe.
""")
                        .categoria(CategoriaArtigo.OUTROS)
                        .autor(admin)
                        .visualizacoes(298L)
                        .uteis(56L)
                        .build(),
                Artigo.builder()
                        .titulo("Política de uso de IA generativa (ChatGPT, Copilot, etc.)")
                        .resumo("O que pode e o que não pode subir em ferramentas de IA — proteção de dados confidenciais e código proprietário.")
                        .conteudo("""
# Uso de IA generativa

## Pode usar
- ChatGPT, Claude, Gemini para perguntas gerais
- GitHub Copilot para autocomplete de código (após aprovação do tech lead)
- Notion AI, Grammarly para revisão de texto

## NUNCA suba
- Código proprietário completo (snippets pequenos são OK)
- Dados de clientes (CPF, CNPJ, e-mails, endereços)
- Credenciais, tokens, chaves de API
- Documentos confidenciais ou estratégicos
- Informações financeiras não públicas

## Use a conta corporativa
- **ChatGPT Team**: provisionado pra todos via `chat.domine.com.br`
- **Copilot for Business**: solicite via chamado ACESSO
- Conta corporativa não usa seu input pra treinar modelo

## Em caso de vazamento acidental
1. Reporte imediatamente ao DPO: `dpo@domine.com.br`
2. Anote: prompt usado, ferramenta, data/hora, conta logada
3. Não delete o histórico — DPO precisa pra avaliar exposição

## Boas práticas
- Generalize exemplos antes de colar
- Trate tudo que vai pra IA como público
- Use diff em vez de código completo quando possível
""")
                        .categoria(CategoriaArtigo.OUTROS)
                        .autor(admin)
                        .visualizacoes(367L)
                        .uteis(72L)
                        .build(),
                Artigo.builder()
                        .titulo("LGPD — direitos dos titulares e como atender pedidos")
                        .resumo("Resposta padronizada para pedidos de acesso, correção, exclusão e portabilidade de dados pessoais.")
                        .conteudo("""
# LGPD — pedidos de titulares

## Direitos garantidos
- **Acesso**: cópia dos dados que temos do titular
- **Correção**: atualização de dados incorretos ou desatualizados
- **Anonimização / Bloqueio / Eliminação**: desde que respeitada base legal
- **Portabilidade**: exportação em formato estruturado
- **Informação**: com quem compartilhamos dados

## Onde chegam os pedidos
Canal único: `privacidade@domine.com.br`
DPO: Ana Costa (`ana.costa@domine.com.br`)

## SLA legal
- Confirmar recebimento em 24h
- Resposta completa em até 15 dias corridos
- Pode ser prorrogado por mais 15 com justificativa

## Fluxo interno
1. DPO recebe e abre chamado interno categoria ACESSO + tag `lgpd`
2. TI gera relatório dos sistemas relevantes
3. Jurídico valida base legal antes de qualquer ação
4. DPO responde ao titular

## Quando recusar
- Pedidos vagos ou genéricos demais
- Quando há obrigação legal de manter (ex.: fiscal por 5 anos)
- Quando afeta direitos de terceiros

Sempre responder com justificativa. Recusa silenciosa = violação.
""")
                        .categoria(CategoriaArtigo.OUTROS)
                        .autor(admin)
                        .visualizacoes(115L)
                        .uteis(18L)
                        .build()
        );

        // Seed idempotente: adiciona apenas os títulos que ainda não existem.
        List<Artigo> novos = artigos.stream()
                .filter(a -> !artigoRepository.existsByTitulo(a.getTitulo()))
                .toList();
        if (novos.isEmpty()) {
            log.info("DataSeeder: artigos já presentes — nada a inserir.");
            return;
        }
        artigoRepository.saveAll(novos);
        log.info("DataSeeder: {} artigos novos inseridos.", novos.size());
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
