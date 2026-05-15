# Handoff: Sprint 2 — Backend CRUDs (Usuario, Equipamento, Chamado, Comentario, Historico)

**Data:** 2026-05-15
**Status:** Em revisão (aguardando validação manual do usuário no Trello)

## 1. Objetivo

Implementar o domínio completo do **Domine** no backend: CRUD de `Usuario` (ADMIN), CRUD de `Equipamento` com `/meus`, CRUD de `Chamado` com regras de propriedade (COMUM vê só os próprios), comentários, histórico de eventos, endpoint de dashboard com agregações e seed de dados realista para a equipe poder testar. É a camada de domínio sobre a qual o frontend (Sprints 3–5) será construído.

## 2. Contexto essencial

- **Sprint 1** entregou: `EntidadeBase`, `Usuario` com perfil ADMIN/COMUM, autenticação JWT, `AuthController`, `GlobalExceptionHandler`, Swagger, DataSeeder com 4 usuários. Tudo continua funcionando.
- **Sprint 2** estende: 4 novas entidades (Equipamento, Chamado, Comentario, HistoricoChamado) + interface `Notificavel` + serviços com lógica de permissão + 35 arquivos Java novos.
- **Decisões técnicas tomadas:**
  - **Notificavel** é interface em `domain/Notificavel.java`. Implementada por `Chamado` e `Equipamento`. Permite `List<Notificavel>` heterogênea — **POO: Polimorfismo + Abstração**.
  - **Chamado.resolver()** muda status para `RESOLVIDO` e preenche `resolvidoEm` em uma operação — lógica de domínio na entidade, **POO: Encapsulamento**.
  - **Chamado.alterarStatusPara(novo)** trata todas as outras transições e preenche `resolvidoEm` defensivamente quando alguém manda RESOLVIDO via PATCH /status.
  - **`SecurityUtils.usuarioAtual()`** extrai o `Usuario` do `SecurityContext` via `UsuarioDetails`. Centraliza pra evitar repetir o cast em cada service.
  - **Serviços com interface + impl** (`EquipamentoService` + `EquipamentoServiceImpl`, `ChamadoService` + `ChamadoServiceImpl`, `UsuarioService` + `UsuarioServiceImpl`) — **POO: Abstração**, padrão repetido como na Sprint 1.
  - **DTOs como `record`** com Bean Validation (`@NotBlank`, `@NotNull`, `@Size`). DTO de update tem `perfil` e `ativo` opcionais (validação só do que veio).
  - **`ChamadoResponse.from(c)`** carrega comentários eager para o detalhe; **`ChamadoResponse.resumo(c)`** retorna sem comentários para listagens (`Page<ChamadoResponse>`).
  - **`@JsonIgnore` em `Comentario.chamado` e `HistoricoChamado.chamado`** previne loop de serialização quando retornamos um Chamado com seus comentários.
  - **Filtros via JPQL `@Query`** com `:param IS NULL OR ...` para opcionalidade. Único caso que dá problema: `LOWER(CONCAT(...))` em string null no PostgreSQL — Hibernate manda o NULL como `bytea` e PG não tem `lower(bytea)`. **Workaround aplicado:** service converte `null` → `""`, query usa `LIKE '%%'` que casa com tudo.
  - **`DataSeeder` defensivo por bloco:** cada seção (usuarios / equipamentos / chamados) checa sua própria tabela. Permite estender o seed entre sprints sem precisar dropar o volume.
  - **`@PreAuthorize("hasRole('ADMIN')")`** nos endpoints restritos. Spring Security usa `ROLE_ADMIN`/`ROLE_COMUM` prefixados via `UsuarioDetails.getAuthorities()`.
  - **Regras de propriedade no Chamado:** lógica no service (`ChamadoServiceImpl.buscarComPermissao()`), lança `AccessDeniedException` (→ 403) quando COMUM tenta acessar chamado de outro.
- **Restrições:**
  - `ddl-auto: update` — Hibernate cria tabelas automaticamente (sem Flyway).
  - Sem testes JUnit (não foi pedido).
  - Sem commits Git automáticos.

## 3. O que já foi feito

### Sprint 0 (concluído anteriormente, REVISÃO no Trello)
- Monorepo, Docker Compose, Dockerfiles, README, .gitignore, git init.

### Sprint 1 (concluído anteriormente, REVISÃO no Trello)
- 23 arquivos Java: `EntidadeBase`, `Usuario`, `UsuarioRepository`, DTOs, `SecurityConfig`, `JwtService`, `JwtAuthenticationFilter`, `UsuarioDetails(Service)`, `AuthService`(Impl)+`AuthController`, `GlobalExceptionHandler` (com `NoResourceFoundException` 404), `OpenApiConfig`, `DataSeeder` com 4 usuários.
- Autenticação JWT funcionando ponta a ponta. Login admin e comum validados.

### Sprint 2 (concluído nesta sessão, REVISÃO no Trello)

**35 arquivos novos:**

1. `config/SecurityUtils.java` — helper estático para `usuarioAtual()`.
2. `domain/Notificavel.java` — interface (POO: Polimorfismo + Abstração).
3. **6 enums:**
   - `enums/TipoEquipamento` { NOTEBOOK, DESKTOP, MONITOR, IMPRESSORA, CELULAR, PERIFERICO, OUTRO }
   - `enums/StatusEquipamento` { EM_USO, ESTOQUE, MANUTENCAO, BAIXADO }
   - `enums/CategoriaChamado` { HARDWARE, SOFTWARE, REDE, ACESSO, EMAIL, IMPRESSAO, OUTRO }
   - `enums/PrioridadeChamado` { BAIXA, MEDIA, ALTA, CRITICA }
   - `enums/StatusChamado` { ABERTO, EM_ATENDIMENTO, AGUARDANDO_USUARIO, RESOLVIDO, FECHADO }
   - `enums/TipoEventoHistorico` { CRIADO, STATUS_ALTERADO, TECNICO_ATRIBUIDO, PRIORIDADE_ALTERADA, COMENTARIO_ADICIONADO }
4. **Equipamento** (`domain/equipamento/`): `Equipamento` entity (implementa `Notificavel`) com método `baixar()` que muda status para BAIXADO e zera responsavel; `EquipamentoRepository` com `filtrar()` JPQL + `findByResponsavelId()`; DTOs (Request/Update/Response); `EquipamentoService`+Impl; `EquipamentoController`.
5. **Chamado** (`domain/chamado/`): `Chamado` entity (implementa `Notificavel`) com `resolver()` e `alterarStatusPara()`; `Comentario` entity; `HistoricoChamado` entity; 3 repositories; 8 DTOs (`ChamadoRequest`, `ChamadoUpdateRequest`, `ChamadoResponse` com `.from()` + `.resumo()`, `StatusUpdateRequest`, `AtribuirTecnicoRequest`, `ComentarioRequest`, `ComentarioResponse`, `HistoricoResponse`, `DashboardResponse` com `Map<String, Long>`); `ChamadoService`+Impl; `ChamadoController`.
6. **Usuario CRUD** (`domain/usuario/`): adicionados `UsuarioService` (interface), `UsuarioServiceImpl`, `UsuarioController` com `@PreAuthorize` ADMIN exceto `/me`.
7. **`config/DataSeeder.java`** estendido: agora seed defensivo (cada bloco roda só se sua tabela está vazia). Popula 5 equipamentos (Dell, HP, LG, Brother, Samsung) e 4 chamados em status variados (ABERTO, EM_ATENDIMENTO, AGUARDANDO_USUARIO, RESOLVIDO) com comentários e histórico realista.

### Bugs encontrados e corrigidos durante validação

- **PostgreSQL `lower(bytea)` na query de filtro de equipamentos:** Hibernate transmite NULL no `LOWER(CONCAT(...))` como `bytea`, PG não tem essa função. **Fix:** service converte null → `""`, query usa `LIKE '%%'` que casa com tudo.
- **DataSeeder pulando equipamentos/chamados:** o check inicial era `if (usuarios > 0) return`, mas usuários já existiam da Sprint 1. **Fix:** seed defensivo por bloco.
- **`@ResponseStatus` import faltando** em `EquipamentoController` e `UsuarioController` — adicionado.

### Validado via curl (em sessão de teste)

| Endpoint | Token | Resultado |
|---|---|---|
| `GET /usuarios/me` | Marina (COMUM) | ✅ 200 com dados próprios |
| `GET /usuarios?size=2` | Admin | ✅ 200 paginado |
| `GET /usuarios` | Marina (COMUM) | ✅ 403 (regra ADMIN-only funciona) |
| `GET /equipamentos` | Admin | ✅ 5 equipamentos |
| `GET /equipamentos/meus` | Marina | ✅ 1 (PAT-0001) |
| `GET /chamados` | Marina | ✅ 2 (só os dela: #1 e #4) — **regra de propriedade ativa** |
| `GET /chamados` | Admin | ✅ 4 (todos) |
| `GET /chamados/dashboard` | Admin | ✅ totalAbertos:1, totalEmAtendimento:1, totalResolvidosMes:1, porPrioridade/Categoria com Map |
| `GET /chamados/2/historico` | Admin | ✅ 3 eventos: CRIADO → TECNICO_ATRIBUIDO → STATUS_ALTERADO |

## 4. Estado atual

**Funcionando:**
- 3 containers de pé (db, backend rebuildado com Sprint 2, frontend).
- Banco populado com 4 usuários + 5 equipamentos + 4 chamados (com 3 comentários e 9 eventos de histórico).
- Todos os endpoints da Sprint 2 respondendo corretamente.
- Swagger UI em `/api/v1/swagger-ui.html` mostra todos os novos endpoints organizados por tag (Autenticação, Usuários, Equipamentos, Chamados).
- Regras de propriedade do Chamado validadas: COMUM acessando chamado alheio retorna 403.

**Não validado / pendente:**
- Frontend ainda não consome nenhum dos novos endpoints (Sprint 4 vai trazer telas de Chamados).
- Não há testes JUnit (não pedido).
- Endpoint `PATCH /atribuir` valida que o técnico é ADMIN, mas não há proteção contra atribuir um técnico inativo.
- Soft delete via `DELETE /usuarios/{id}` foi implementado como `ativo=false`, mas o filtro de listagem ainda não exclui inativos automaticamente.

**Trello no fim da sessão:**
- 12 cards `[S2]` em **REVISÃO** (acabaram de ser movidos).
- 7 cards `[S3]` em **EM ANDAMENTO** (5 implementados — login + dashboard + voltagent + azul + vídeo; 2 ainda no BACKLOG: shadcn/ui institucionalizado, AppLayout/Sidebar full).
- Sprint 4 (Chamados frontend), Sprint 5 (Equip+Usuários frontend), Sprint 6 (entrega) seguem no BACKLOG.

## 5. Próximos passos

1. **Aguardar usuário validar Sprint 2** manualmente: testar Swagger, criar chamados, atribuir técnico, comentar, mudar status, conferir dashboard. Quando aprovar, mover `[S2]` REVISÃO → CONCLUÍDO.
2. **Sugerir primeiro commit Git** (se ainda não fez):
   ```bash
   cd /Users/igormoreira/dev/freela/domine
   git add .
   git commit -m "feat: Sprint 2 — Equipamento, Chamado, Comentario, Historico, dashboard"
   ```
3. **Continuar Sprint 3** (frontend layout + sidebar dinâmico) ou pular pra **Sprint 4** (frontend de Chamados consumindo endpoints novos):
   - Dashboard COMUM com cards próprios
   - Dashboard ADMIN com agregações via `/chamados/dashboard`
   - Tela lista de Chamados (com filtros, paginação) consumindo `GET /chamados`
   - Tela detalhe com timeline misturando comentários + histórico
   - Form de novo chamado consumindo `POST /chamados`
   - Mutations: status, atribuir, comentar
4. **Validar Sprint 4** via browser.
5. **Criar `handoff-sprint-03.md` e/ou `handoff-sprint-04.md`** após.

## 6. Perguntas em aberto

- **`/usuarios` listagem ainda não tem filtro por nome/perfil/ativo aplicado** — implementei com `findAll(pageable)`, ignorando os params. Suficiente para escopo, mas pode incomodar nos testes. Implementar JPQL similar ao de Equipamento se necessário.
- **`Chamado.alterarStatusPara` aceita qualquer transição** — não há máquina de estados (ABERTO → EM_ATENDIMENTO → RESOLVIDO, etc). Decisão consciente: simplicidade > rigor. Adicionar se professor cobrar.
- **Não há paginação dos comentários** dentro de `ChamadoResponse.from()`. Para chamados com >50 comentários, o detalhe pode ficar pesado. Não é problema no escopo atual (seed tem no máximo 1 comentário por chamado).
- **`tecnicoResponsavel` precisa ter perfil ADMIN** (validação na atribuição), mas se mais tarde o admin desabilitar o técnico, o chamado continua atribuído a ele. Não tratado.
- **DataSeeder estendido modifica timestamps:** quando seeded em sessões diferentes, os equipamentos vão ter `criadoEm` diferente dos usuários. Ok pra escopo, mas notar.
- **Commit Git** ainda não foi feito desde Sprint 0 — sugerir após validação.

## 7. Artefatos relevantes

### Estrutura criada nesta sessão

```
backend/src/main/java/br/com/domine/gestaoti/
├── config/
│   ├── SecurityUtils.java                       (NOVO)
│   └── DataSeeder.java                          (atualizado — defensivo + equipamentos + chamados)
├── domain/
│   ├── Notificavel.java                         (NOVO — POO Polimorfismo+Abstração)
│   ├── equipamento/
│   │   ├── Equipamento.java                     (implementa Notificavel, baixar())
│   │   ├── EquipamentoRepository.java           (filtrar(), findByResponsavelId)
│   │   ├── EquipamentoService.java              (interface)
│   │   ├── EquipamentoServiceImpl.java
│   │   ├── EquipamentoController.java
│   │   └── dto/{EquipamentoRequest,EquipamentoUpdateRequest,EquipamentoResponse}.java
│   ├── chamado/
│   │   ├── Chamado.java                         (implementa Notificavel, resolver(), alterarStatusPara())
│   │   ├── Comentario.java                      (@JsonIgnore chamado)
│   │   ├── HistoricoChamado.java                (@JsonIgnore chamado)
│   │   ├── ChamadoRepository.java               (filtrar(), countByStatus, contarPorPrioridade/Categoria)
│   │   ├── ComentarioRepository.java
│   │   ├── HistoricoChamadoRepository.java      (findByChamadoIdOrderByCriadoEmAsc)
│   │   ├── ChamadoService.java + Impl
│   │   ├── ChamadoController.java
│   │   └── dto/{ChamadoRequest, ChamadoUpdateRequest, ChamadoResponse, StatusUpdateRequest,
│   │             AtribuirTecnicoRequest, ComentarioRequest, ComentarioResponse,
│   │             HistoricoResponse, DashboardResponse}.java
│   └── usuario/
│       ├── UsuarioService.java                  (NOVO — interface)
│       ├── UsuarioServiceImpl.java              (NOVO)
│       └── UsuarioController.java               (NOVO — /me, CRUD ADMIN)
└── enums/
    ├── TipoEquipamento.java
    ├── StatusEquipamento.java
    ├── CategoriaChamado.java
    ├── PrioridadeChamado.java
    ├── StatusChamado.java
    └── TipoEventoHistorico.java
```

### Endpoints novos (Sprint 2) — base path `/api/v1`

| Método | Path | Acesso | Descrição |
|---|---|---|---|
| GET | `/usuarios/me` | autenticado | dados do próprio usuário |
| GET | `/usuarios` | ADMIN | lista paginada |
| GET | `/usuarios/{id}` | ADMIN | detalhe |
| POST | `/usuarios` | ADMIN | criar (com BCrypt) |
| PUT | `/usuarios/{id}` | ADMIN | atualizar |
| DELETE | `/usuarios/{id}` | ADMIN | soft delete (ativo=false) |
| GET | `/equipamentos` | ADMIN | filtros tipo/status/patrimonio, paginado |
| GET | `/equipamentos/meus` | autenticado | onde responsavel = usuário logado |
| GET | `/equipamentos/{id}` | autenticado | detalhe |
| POST | `/equipamentos` | ADMIN | criar |
| PUT | `/equipamentos/{id}` | ADMIN | atualizar |
| DELETE | `/equipamentos/{id}` | ADMIN | soft delete (status=BAIXADO) |
| GET | `/chamados` | autenticado | COMUM vê só os seus, ADMIN vê todos; filtros status/prioridade/categoria/tecnicoResponsavelId |
| GET | `/chamados/dashboard` | ADMIN | agregações com `Map<String, Long>` |
| GET | `/chamados/{id}` | dono ou ADMIN | detalhe com comentários |
| POST | `/chamados` | autenticado | criar (solicitante = logado) |
| PUT | `/chamados/{id}` | ADMIN tudo; COMUM só descrição se ABERTO | atualizar |
| PATCH | `/chamados/{id}/status` | ADMIN | mudar status; se RESOLVIDO preenche `resolvidoEm`; registra histórico |
| PATCH | `/chamados/{id}/atribuir` | ADMIN | atribuir técnico (deve ser ADMIN) |
| POST | `/chamados/{id}/comentarios` | solicitante ou ADMIN | adicionar comentário |
| GET | `/chamados/{id}/historico` | dono ou ADMIN | lista cronológica de eventos |

### Comandos úteis

```bash
# Subir tudo
cd /Users/igormoreira/dev/freela/domine && docker compose up -d

# Rebuild backend após mudar Java
docker compose up --build -d backend

# Login admin
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@domine.com.br","senha":"admin123"}' \
  | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

# Dashboard
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/chamados/dashboard

# Criar chamado (logado como COMUM)
TOKEN_C=$(...) # login marina
curl -X POST http://localhost:8080/api/v1/chamados \
  -H "Authorization: Bearer $TOKEN_C" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Teste","descricao":"Descrição teste 123","categoria":"REDE","prioridade":"BAIXA"}'

# Mudar status como ADMIN
curl -X PATCH http://localhost:8080/api/v1/chamados/1/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"EM_ATENDIMENTO"}'

# Atribuir técnico
curl -X PATCH http://localhost:8080/api/v1/chamados/1/atribuir \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tecnicoId":1}'

# Comentar
curl -X POST http://localhost:8080/api/v1/chamados/1/comentarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"texto":"Investigando o problema agora"}'

# Reset DB (apaga volume — força reseed na próxima subida)
docker compose down -v && docker compose up -d --build

# Compile só (validação rápida sem Docker)
cd backend && JAVA_HOME="/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home" \
  PATH="$JAVA_HOME/bin:$PATH" mvn -B clean compile
```

### Links

- **Trello**: https://trello.com/b/hfqG2kcO/projeto-terceiro-semestre
- **Swagger**: http://localhost:8080/api/v1/swagger-ui.html
- **Frontend**: http://localhost:5173 (login PT-BR azul com vídeo)

## 8. Instruções pra próxima sessão

- **Tom**: técnico-direto, em português, sem emojis salvo se o usuário usar.
- **Confirmar antes de**: commitar git, force push, mudar nome do projeto, mexer em configs globais, deletar dados ou volumes, instalar pacotes na máquina.
- **Não precisa confirmar pra**: criar/editar arquivos Java/TS, rebuild Docker, mover cards Trello dentro do workflow estabelecido, rodar curl, hot-reload de Tailwind/Vite.
- **Trello workflow**: implementação → EM ANDAMENTO; terminou → REVISÃO; usuário valida e move pra CONCLUÍDO. Nunca pular pra CONCLUÍDO direto.
- **Volumes do docker-compose** agora incluem todos os arquivos de config do frontend (tailwind.config.js, postcss.config.js, vite.config.ts, tsconfig.json, components.json, index.html). Mudanças nesses arquivos refletem ao vivo sem rebuild — só precisa de rebuild quando muda Dockerfile ou package.json (adicionar deps).
- **Armadilhas reais já observadas:**
  - `tailwind.config.js`: até a Sprint 2 não estava montado, mudanças exigiam rebuild. Agora resolvido.
  - PostgreSQL não tem `lower(bytea)`: cuidado com `LOWER(CONCAT(...))` em parâmetros nullable. Workaround: converter null para `""` no service.
  - `@JsonIgnore` em `Comentario.chamado` e `HistoricoChamado.chamado` é necessário pra evitar loop infinito de serialização.
  - `@PreAuthorize` precisa do `@EnableMethodSecurity(prePostEnabled = true)` no `SecurityConfig` (já tem desde Sprint 1).
  - `ROLE_` prefix nas roles é convenção do Spring Security — está em `UsuarioDetails.getAuthorities()`.
  - `DataSeeder` agora é defensivo por bloco. Pode estender pra Sprint 3+ adicionando novas seções sem dropar volume.
  - O método `@Builder.Default` no campo `ativo` da Usuario gera warning Maven (não bloqueia). Limpar quando bater.
- **POO acadêmica — princípios cobertos até aqui:**
  - Sprint 1 ✅: Herança (`EntidadeBase`), Encapsulamento (Usuario, métodos de domínio), Abstração (`AuthService` interface).
  - **Sprint 2** ✅: **Polimorfismo** (interface `Notificavel` implementada por `Chamado` e `Equipamento`); reforço de Abstração (3 services com interface+impl); Encapsulamento (`chamado.resolver()`, `chamado.alterarStatusPara()`, `equipamento.baixar()`).
- **Estruturas de dados acadêmicas:**
  - `List<Comentario>` ordenada por `criadoEm ASC` (`@OrderBy`).
  - `List<HistoricoChamado>` retornada pelo repository ordenada.
  - **`Map<String, Long>`** em `DashboardResponse.porPrioridade` e `porCategoria` (estrutura central pra acadêmico).
- **Spec original** está na mensagem do usuário no início desta thread ("Prompt para Claude Code — Sistema Domine"). É a fonte de verdade.
- **Próxima sprint óbvia** = Sprint 4 (Chamados no frontend), já que Sprint 3 está parcial (login + dashboard básico prontos).
