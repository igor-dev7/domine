# Handoff: Sprint 1 — Backend Auth + Estrutura Base

**Data:** 2026-05-15
**Status:** Em revisão (aguardando validação manual do usuário no Trello)

## 1. Objetivo

Subir o backend Spring Boot do **Domine** (sistema de gestão de TI — projeto integrador 3º semestre ADS, ExpoTech 2026) com autenticação JWT funcional ponta-a-ponta, modelagem inicial de `Usuario` com perfis ADMIN/COMUM, tratamento padronizado de erros e Swagger UI configurado. É a base sobre a qual os CRUDs de Equipamento e Chamado (Sprint 2) e o frontend (Sprint 3+) serão construídos.

## 2. Contexto essencial

- **Stack backend**: Java 21 · Spring Boot 3.3.4 · Spring Security stateless · jjwt 0.12.6 · PostgreSQL 16 · Maven 3.9 · Docker Compose. Roda em OrbStack (não Docker Desktop).
- **Stack frontend**: ainda placeholder Vite + React + TS (será implementado a partir do Sprint 3).
- **Contexto acadêmico**: trabalho da faculdade, equipe de 6 alunos. Princípios POO precisam aparecer **explicitamente** no código (comentários `POO: Herança` etc) porque os professores avaliam isso.
- **Workflow Trello** (board "Projeto Terceiro semestre", short link `hfqG2kcO`):
  `BACKLOG → EM ANDAMENTO → REVISÃO → CONCLUÍDO`. O usuário valida cada sprint manualmente antes de mover REVISÃO → CONCLUÍDO. Nunca pular direto para CONCLUÍDO.
- **Decisões técnicas tomadas e seus motivos**:
  - **Pacotes organizados por feature** (`domain/auth/`, `domain/usuario/`), não por camada — conforme spec original do usuário.
  - **`EntidadeBase` abstract `@MappedSuperclass`** (não `@Entity`) centraliza `id` + `criadoEm` + `atualizadoEm`. Reaplicar em todas as próximas entidades.
  - **`UsuarioDetails` é um wrapper** sobre `Usuario` (não fizemos `Usuario implements UserDetails`) — evita acoplar a entidade JPA com a interface do Spring Security.
  - **`AuthService` interface + `AuthServiceImpl`** — padrão a repetir nos próximos services (UsuarioService, ChamadoService, EquipamentoService) para evidenciar **abstração** acadêmica.
  - **`senha` da Usuario com `@JsonIgnore`** — nunca vaza em response.
  - **JWT usa HS384** (secret de 50 bytes força jjwt 0.12 a escolher HS384 automaticamente). Funciona, mas se quiser HS256 explícito, encurtar a chave ou usar `signWith(key, Jwts.SIG.HS256)`.
  - **`ddl-auto: update`** (cria tabelas automaticamente). Não usa Flyway/Liquibase — escopo acadêmico não justifica.
  - **`DataSeeder` só roda se banco vazio** (`usuarioRepository.count() == 0`). Idempotente.
  - **Backend em `:8080` com context-path `/api/v1`**; frontend em `:5173`. CORS liberado apenas para `http://localhost:5173`.
- **Restrições**:
  - Spec original do usuário (cole no Prompt para Claude Code — Sistema Domine) é a **fonte de verdade**. Não inventar features extras.
  - Não criar testes JUnit a menos que pedido explicitamente.
  - Não commitar Git sem autorização explícita.

## 3. O que já foi feito

### Sprint 0 (concluído em sessão anterior; cards em REVISÃO no Trello)

- Monorepo `backend/` + `frontend/` + `docker-compose.yml`
- Dockerfile backend multi-stage (`maven:3.9-eclipse-temurin-21` → `eclipse-temurin:21-jre-alpine`)
- Dockerfile frontend (`node:22-alpine` + Vite dev server)
- `README.md`, `.gitignore` (Java + Node), `git init` *(primeiro commit ainda pendente)*
- Java 21 (`openjdk@21`) + Maven 3.9 instalados via Homebrew, `~/.zshrc` com `JAVA_HOME`
- Stack roda end-to-end: 3 containers de pé, `GET /health` responde `UP`, frontend serve placeholder, Swagger UI acessível

### Sprint 1 (concluído nesta sessão; cards em REVISÃO no Trello)

1. `pom.xml` com Spring Boot 3.3 + Web + Data JPA + Security + Validation + jjwt 0.12.6 + Lombok + springdoc 2.6 + driver postgres
2. `application.yml` + `application-docker.yml` (lê env vars `SPRING_DATASOURCE_*`, `JWT_SECRET`, `JWT_EXPIRATION_MS`)
3. `domain/EntidadeBase` `@MappedSuperclass` — **POO: Herança**
4. `enums/PerfilUsuario { ADMIN, COMUM }`
5. `domain/usuario/Usuario` (Lombok `@Getter/@Setter/@Builder/@NoArgsConstructor/@AllArgsConstructor`, email único, `senha @JsonIgnore`, método `isAdmin()` — **POO: Encapsulamento**)
6. `UsuarioRepository` com `findByEmail` + `existsByEmail`
7. DTOs (records com Bean Validation): `UsuarioRequest`, `UsuarioUpdateRequest`, `UsuarioResponse`
8. `exception/ResourceNotFoundException`, `BusinessException`, `ErroResponse`, `GlobalExceptionHandler` (`@RestControllerAdvice`) tratando:
   - `MethodArgumentNotValidException` → 400
   - `ResourceNotFoundException` → 404
   - `NoResourceFoundException` (Spring 6, rota inexistente) → 404
   - `BusinessException` → 422
   - `BadCredentialsException` → 401
   - `AccessDeniedException` → 403
   - `Exception` genérica → 500 (com log)
9. `domain/auth/JwtService` (gera/valida tokens, claims `sub=email, userId, perfil`, exp 24h)
10. `UsuarioDetails` (wrapper `UserDetails`), `UsuarioDetailsService` (`implements UserDetailsService`, busca por email)
11. `JwtAuthenticationFilter` (`OncePerRequestFilter`, header `Authorization: Bearer`, popula `SecurityContext`)
12. DTOs `LoginRequest`, `LoginResponse` (com inner record `UsuarioMin`)
13. `AuthService` interface + `AuthServiceImpl` — **POO: Abstração**
14. `AuthController` (`POST /auth/login`) com `@Tag` e `@Operation` do OpenAPI
15. `SecurityConfig` refatorado: stateless, CSRF off, CORS via `corsConfigurationSource()` bean, `JwtAuthenticationFilter` antes do `UsernamePasswordAuthenticationFilter`, `AuthenticationManager` bean, `BCryptPasswordEncoder`, `@EnableMethodSecurity(prePostEnabled = true)`
16. `config/OpenApiConfig` com schema global `bearerAuth` JWT
17. `config/DataSeeder` (`CommandLineRunner`) com 1 admin + 3 comuns (idempotente)
18. `config/HealthController` mantido (`GET /health` público)

### Validado manualmente via curl

| Cenário | Esperado | Real |
|---|---|---|
| `POST /auth/login` admin correto | 200 + JWT | ✅ 200 + JWT (perfil ADMIN) |
| `POST /auth/login` comum correto | 200 + JWT | ✅ 200 + JWT (perfil COMUM) |
| `POST /auth/login` senha errada | 401 padronizado | ✅ 401 + `ErroResponse` |
| `GET /usuarios` sem token | 401/403 | ✅ 403 |
| `GET /usuarios` com token | 404 (não existe ainda) | ✅ 404 + `ErroResponse` |
| `GET /health` | 200 | ✅ 200 |
| Swagger UI | acessível | ✅ HTTP 200 em `/swagger-ui.html` |

## 4. Estado atual

**Funcionando:**
- 3 containers Docker rodando (db, backend, frontend) via OrbStack
- Backend em `http://localhost:8080/api/v1` (atenção ao context-path)
- Frontend em `http://localhost:5173` (placeholder de Sprint 0)
- Swagger em `http://localhost:8080/api/v1/swagger-ui.html`
- 4 usuários seedados no banco (admin + marina + carlos + joao)
- Auth ponta-a-ponta: login retorna JWT, filtro valida JWT em requests subsequentes

**Não validado / faltando:**
- Frontend ainda não consome `/auth/login` (não há tela de login real)
- Nenhum endpoint protegido funcional além do filtro (tudo retorna 404 ainda — Sprint 2 traz CRUDs)
- Sem testes JUnit (test starter no pom, sem classes de teste)
- Primeiro commit Git ainda pendente
- Validação manual do usuário ainda **não foi feita** — cards estão em REVISÃO

**Trello no fim da sessão:**
- 6 cards `[S0]` em **REVISÃO**
- 11 cards `[S1]` em **REVISÃO** (acabaram de ser movidos)
- 12 cards `[S2]` no **BACKLOG**

## 5. Próximos passos

1. **Aguardar usuário validar** Sprint 1 manualmente (testar Swagger, logar com admin e comum, confirmar response no /auth/login). Quando aprovar, mover cards `[S1]` de REVISÃO → CONCLUÍDO.
2. **Sugerir primeiro commit Git** após aprovação:
   ```bash
   cd /Users/igormoreira/dev/freela/domine
   git add .
   git commit -m "feat: Sprint 0 + 1 — scaffold + auth JWT"
   ```
3. **Mover** todos os 12 cards `[S2]` de BACKLOG → EM ANDAMENTO ao iniciar Sprint 2.
4. **Implementar Sprint 2** (ordem sugerida):
   - Entidade `Equipamento` + enums `TipoEquipamento`, `StatusEquipamento`
   - Entidade `Chamado` + enums `Categoria`, `Prioridade`, `Status`. Método de domínio `chamado.resolver()` (POO: Encapsulamento)
   - Entidade `Comentario` e `HistoricoChamado` + enum `TipoEventoHistorico`
   - **Interface `Notificavel`** implementada por `Chamado` e `Equipamento` — **POO: Polimorfismo** (obrigatório pro acadêmico)
   - `UsuarioController` + `UsuarioService` (interface + impl) — CRUD ADMIN, soft delete (`ativo=false`)
   - `EquipamentoController` + Service — CRUD ADMIN + `GET /equipamentos/meus`
   - `ChamadoController` + Service — CRUD com regras de propriedade (COMUM vê só os seus, lançar `AccessDeniedException` quando violar)
   - `PATCH /chamados/{id}/status` + `PATCH /chamados/{id}/atribuir` + `POST /chamados/{id}/comentarios` + `GET /chamados/{id}/historico`
   - `GET /chamados/dashboard` retornando `Map<String, Long>` — **estrutura de dados Map**
   - `DataSeeder` estendido com 5 equipamentos + 4 chamados (com comentários e histórico)
5. **Validar Sprint 2** via curl em todos os endpoints (admin vs comum) + Swagger.
6. **Criar handoff Sprint 2** em `/docs/handoff-sprint-02.md` no mesmo formato e mover cards `[S2]` para REVISÃO.

## 6. Perguntas em aberto

- **Primeiro commit Git** — usuário ainda não autorizou explicitamente. Sugerir após aprovação do Sprint 1.
- **`ddl-auto: update`** — funciona pra dev, mas em produção/entrega convém Flyway. Manter como está pra escopo acadêmico ou trocar?
- **Swagger UI bearerAuth global** — todos os endpoints aparecem como "Autenticação requerida" inclusive `/auth/login`. Confuso visualmente. Considerar `@SecurityRequirements({})` em `AuthController` pra limpar.
- **`JwtAuthenticationFilter` chama `loadUserByUsername()` a cada request** — bate no Postgres todo request autenticado. Em produção cachearia (Caffeine). Escopo acadêmico não justifica.
- **`@JsonIgnore` na senha** — funciona, mas se quiser segurança extra, marcar como `@JsonProperty(access = WRITE_ONLY)` permite receber no `UsuarioRequest` ao criar mas nunca devolver. Não é blocker.
- **Endpoint `/usuarios/me`** previsto no spec (Sprint 2) — qual perfil pode chamar? Spec diz "qualquer autenticado". Confirmar.

## 7. Artefatos relevantes

### Estrutura criada nesta sessão

```
backend/src/main/java/br/com/domine/gestaoti/
├── DomineApplication.java                              (Sprint 0)
├── domain/
│   ├── EntidadeBase.java                              (POO: Herança)
│   ├── usuario/
│   │   ├── Usuario.java                                (POO: Encapsulamento)
│   │   ├── UsuarioRepository.java
│   │   └── dto/{UsuarioRequest,UsuarioUpdateRequest,UsuarioResponse}.java
│   └── auth/
│       ├── JwtService.java
│       ├── UsuarioDetails.java
│       ├── UsuarioDetailsService.java
│       ├── JwtAuthenticationFilter.java
│       ├── AuthService.java                            (POO: Abstração — interface)
│       ├── AuthServiceImpl.java
│       ├── AuthController.java
│       └── dto/{LoginRequest,LoginResponse}.java
├── enums/PerfilUsuario.java
├── exception/
│   ├── ResourceNotFoundException.java
│   ├── BusinessException.java
│   ├── ErroResponse.java
│   └── GlobalExceptionHandler.java
└── config/
    ├── SecurityConfig.java                             (refatorado)
    ├── OpenApiConfig.java                              (novo)
    ├── DataSeeder.java                                 (novo)
    └── HealthController.java                           (Sprint 0)
```

### Credenciais de teste (DataSeeder)

| Perfil | Email | Senha |
|---|---|---|
| ADMIN | `admin@domine.com.br` | `admin123` |
| COMUM | `marina@domine.com.br` | `senha123` |
| COMUM | `carlos@domine.com.br` | `senha123` |
| COMUM | `joao@domine.com.br` | `senha123` |

### Comandos úteis

```bash
# Subir tudo
cd /Users/igormoreira/dev/freela/domine && docker compose up -d

# Rebuild só backend (após mudar código Java)
docker compose up --build -d backend

# Logs do backend
docker logs domine-backend --tail 50 -f

# Banco direto
docker exec domine-db psql -U domine -d domine -c "SELECT id, email, perfil FROM usuarios;"

# Login admin
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@domine.com.br","senha":"admin123"}'

# Salvar token em var e chamar endpoint protegido
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@domine.com.br","senha":"admin123"}' \
  | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/algum-endpoint

# Compile só (sem docker) — útil pra pegar erros rápido
JAVA_HOME="/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home" \
  PATH="$JAVA_HOME/bin:$PATH" \
  mvn -B clean compile

# Reset total (apaga volumes do db, força reseed na próxima subida)
docker compose down -v && docker compose up --build -d
```

### Links

- **Trello**: https://trello.com/b/hfqG2kcO/projeto-terceiro-semestre
- **Repo local**: `/Users/igormoreira/dev/freela/domine`
- **Swagger**: http://localhost:8080/api/v1/swagger-ui.html
- **Frontend placeholder**: http://localhost:5173

## 8. Instruções pra próxima sessão

- **Tom**: técnico-direto, em português, sem emojis (a menos que o usuário use primeiro). Respostas curtas.
- **Confirmar antes de**: commitar git, force push, mudar nome do projeto, mexer em configs globais, deletar coisa, instalar pacotes na máquina do usuário.
- **Não precisa confirmar pra**: criar/editar arquivos Java/TS, rebuild Docker, mover cards Trello (workflow já estabelecido), rodar curl/testes locais.
- **Trello workflow** (importante): implementação → EM ANDAMENTO; ao terminar → REVISÃO; usuário valida → CONCLUÍDO. **Nunca pular direto pra CONCLUÍDO.**
- **Armadilhas reais já observadas:**
  - DataSeeder roda na thread principal do startup. Login pode dar 401 nos primeiros segundos. Esperar log `Started DomineApplication in X seconds`.
  - Spring 6 lança `NoResourceFoundException` (não 404 default) pra rotas inexistentes. Handler já existe — não duplicar.
  - JWT secret tem 50 bytes → jjwt escolhe HS384 automaticamente. Se quiser HS256 explícito, encurtar secret ou passar algoritmo.
  - Lombok `@Builder` **não funciona em records**. Usar só em classes regulares (`Usuario` é classe, DTOs são records).
  - `Bash` em background: notificação chega quando processo termina. `docker compose up` (foreground) só "termina" se containers caírem.
  - OrbStack: se daemon estiver parado, `orbctl start` resolve. Socket fica em `~/.orbstack/run/docker.sock`, não `/var/run/docker.sock`.
- **POO acadêmica — qual princípio cada sprint cobre:**
  - Sprint 1 ✅: Herança (`EntidadeBase`) + Encapsulamento (`Usuario`, métodos de domínio) + Abstração (`AuthService` interface)
  - Sprint 2 (próxima): Polimorfismo (`Notificavel` em `Chamado` e `Equipamento`) + reforço de Abstração (services com interface) + Encapsulamento (`chamado.resolver()`)
- **Estruturas de dados** a destacar para o acadêmico:
  - `List<>` — comentários por data, histórico de eventos (Sprint 2)
  - `Map<>` — `/chamados/dashboard` agregações (Sprint 2)
  - `Set<>` — se aplicável (Sprint futuro)
- **Spec original** está na 2ª mensagem do usuário desta thread (começa com "Prompt para Claude Code — Sistema Domine"). É a fonte de verdade. Em caso de conflito com qualquer ideia minha, a spec vence.
- **Não inventar** features extras (testes, métricas Prometheus, OAuth2, refresh token etc) a menos que o usuário peça.
- **Não inventar datas** ou estimativas precisas — sprint pode levar o tempo que precisar.
