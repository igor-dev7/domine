# Handoff: Sprints 4 + 5 — Frontend de Chamados, Equipamentos e Usuários

**Data:** 2026-05-15
**Status:** Em revisão (Sprints 4 e 5 aguardando validação manual do usuário no Trello)

## 1. Objetivo

Concluir o frontend do domínio do **Domine**: Sprint 4 entregou o fluxo completo de Chamados (dashboard, lista, detalhe com timeline, novo, mutations); Sprint 5 entregou CRUDs de Equipamentos (admin + meus) e Usuários (admin), com `AdminRoute`, `ConfirmDialog` e polimento de empty/loading states. Encerra a parte funcional do produto — a Sprint 6 cuida de docs/apresentação e a Sprint 7 (criada no fim desta sessão) cuida do refinamento de UI design.

## 2. Contexto essencial

- **Stack frontend** (sem mudanças desde a Sprint 3): Vite 5 · React 18 · TypeScript strict · TailwindCSS 3 · TanStack Query 5 · Axios · React Router 6 · React Hook Form + Zod · Lucide React · shadcn/ui · Sonner.
- **Container**: `domine-frontend` (node:22-alpine), hot reload pra `src/`, configs e `components.json`. Mudanças em `package.json` ainda exigem `docker compose up --build -d frontend`.
- **Decisões técnicas tomadas nessa janela:**
  - **Toaster Sonner** montado em `App.tsx` (richColors, top-right, theme dark). Substitui `alert()` em todo lugar.
  - **`<AdminRoute />`** (Sprint 5) preenche o gap que existia desde a Sprint 3 — redireciona para `/dashboard` qualquer não-ADMIN.
  - **`<ConfirmDialog />`** reutilizável (`Dialog` shadcn + estado destrutivo + loading). Usado em "dar baixa" e "desativar usuário".
  - **`<EmptyState />` e `<Skeleton*/>`** centralizam estado vazio e loading. Aplicados em todas as listas e dashboard.
  - **Hooks de query e mutation organizados por domínio:** `lib/chamados.ts`, `lib/equipamentos.ts`, `lib/usuarios.ts`. Cada arquivo exporta `xxxKeys` (factory de query keys) + hooks `useXxx` / `useCriarXxx` / `useAtualizarXxx` / `useExcluirXxx`. Invalidação de cache cruzada (ex.: atualizar equipamento invalida `chamadosKeys.lists()` porque chamados mostram patrimônio).
  - **`<StatusBadge>` e `<PrioridadeBadge>`** reutilizáveis com paleta semântica (Sprint 4).
  - **Timeline do Chamado** como `List<EventoTimeline>` discriminada (`comentario | historico`), ordenada por `criadoEm` ASC — estrutura de dados acadêmica explícita.
  - **Form de criação e edição** compartilham a mesma rota quando faz sentido (`/equipamentos/novo` vs `/equipamentos/:id/editar`; `/usuarios/novo` vs `/usuarios/:id/editar`). Modo decidido por `useParams.id`.
  - **Senha do usuário** só aparece no schema de criação. Em edição, `UsuarioEditar` é um componente separado dentro do mesmo arquivo (sem o campo).
  - **Bug fix do fim da sessão**: `useMeusEquipamentos` estava tipando `/equipamentos/meus` como `EquipamentoResponse[]`; o backend retorna `Page<EquipamentoResponse>`. Hook corrigido para extrair `.content` com `size: 100`.
- **Restrições mantidas:** sem testes Vitest/RTL, sem commit Git, dark-only.

## 3. O que já foi feito

### Sprint 3 (recapitulando, já em REVISÃO)
Setup frontend + shadcn/ui + AppLayout/Sidebar/Header.

### Sprint 4 — Frontend de Chamados (6 cards, todos em REVISÃO)

1. **Tipos e helpers** (`src/types/index.ts`, `src/lib/format.ts`): enums + DTOs espelhando o backend; labels PT-BR (`statusChamadoLabel`, `prioridadeChamadoLabel`, `categoriaChamadoLabel`, `tipoEquipamentoLabel`, `statusEquipamentoLabel`, `tipoEventoLabel`); `formatarDataHora`, `formatarData`, `iniciaisDe`.
2. **Hooks de Chamados** (`src/lib/chamados.ts`): `useChamados`, `useChamado`, `useHistoricoChamado`, `useDashboard`, `useCriarChamado`, `useAtualizarStatus`, `useAtribuirTecnico`, `useAdicionarComentario`. `chamadosKeys` factory.
3. **Hooks auxiliares**: `src/lib/equipamentos.ts` (initial: `useMeusEquipamentos`, `useEquipamentosLista`), `src/lib/usuarios.ts` (initial: `useUsuariosLista`, `useAdmins`).
4. **`<StatusBadge>` e `<PrioridadeBadge>`** (`src/components/`): cores semânticas.
5. **`<EmptyState>` e `<Skeleton*/>`** (`src/components/`): placeholders consistentes.
6. **`<Toaster />` Sonner** montado em `App.tsx`; `alert()` do Login viraram `toast.error/info`.
7. **Páginas**:
   - `pages/Dashboard.tsx` reescrito: discriminado por perfil. COMUM com 4 KPIs (contagem client-side) + lista dos 5 mais recentes + botão "Abrir novo chamado". ADMIN com `useDashboard()` (3 KPIs + dois cards de barras horizontais Por prioridade/Categoria) + fila dos 5 mais recentes com solicitante.
   - `pages/ChamadosLista.tsx`: `<Table>` shadcn, filtros (status/prioridade/categoria) + busca por título/descrição, paginação Spring com Anterior/Próxima, click → detalhe. `placeholderData: prev` pra evitar flash.
   - `pages/ChamadoNovo.tsx`: react-hook-form + Zod (título 5–150, descrição 10–2000), Select de categoria/prioridade, equipamento (lista filtrada por perfil), toast + redirect `/chamados/{id}`.
   - `pages/ChamadoDetalhe.tsx`: layout 2 colunas. Esquerda: descrição + chip de equipamento + timeline (`List<EventoTimeline>` mesclando comentário e histórico, ordenada por `criadoEm` ASC) + form de novo comentário. Direita: card "Situação" + card "Ações ADMIN" (Select de status e de admins pra atribuir). Tratamento 403/404 com EmptyState + voltar.

### Sprint 5 — Frontend de Equipamentos e Usuários (4 cards, todos em REVISÃO)

1. **`<AdminRoute />`** (`src/components/AdminRoute.tsx`): redireciona para `/dashboard` se não for ADMIN. Aplicado em equipamentos admin + usuários inteiro.
2. **`<ConfirmDialog />`** (`src/components/ConfirmDialog.tsx`): Dialog shadcn reutilizável (`titulo`, `descricao`, `textoConfirmar`, `destrutivo`, `carregando`, `onConfirmar`).
3. **Equipamentos**:
   - `lib/equipamentos.ts` estendido com `useEquipamentos(filtro)`, `useEquipamento(id)`, `useCriarEquipamento`, `useAtualizarEquipamento(id)`, `useExcluirEquipamento`. Invalidam `equipamentosKeys.all` + `chamadosKeys.lists()`.
   - `pages/EquipamentosLista.tsx` (admin): tabela com filtros tipo/status + busca patrimônio/modelo, paginação, badges de status, ações Editar/Baixar (com ConfirmDialog).
   - `pages/MeusEquipamentos.tsx` (qualquer autenticado): tabela enxuta de `GET /equipamentos/meus`.
   - `pages/EquipamentoForm.tsx`: mesma rota cria e edita, Zod espelhando backend, Select de responsável com `useUsuariosLista` filtrado por `ativo`.
4. **Usuários** (todos ADMIN-only):
   - `lib/usuarios.ts` estendido com `useUsuarios(filtro)`, `useUsuario(id)`, `useCriarUsuario`, `useAtualizarUsuario(id)`, `useDesativarUsuario`.
   - `pages/UsuariosLista.tsx`: tabela com badges (Perfil ADMIN/COMUM + Situação Ativo/Inativo), ações Editar/Desativar. Botão Desativar fica disabled pra usuários já inativos **e pro próprio admin logado** (evita auto-tijolada).
   - `pages/UsuarioForm.tsx`: dois subcomponentes — `UsuarioCriar` (com senha 6–60) e `UsuarioEditar` (sem senha, com Select Ativo/Inativo).
5. **Rotas** atualizadas em `App.tsx`:
   - `/chamados`, `/chamados/novo`, `/chamados/:id`, `/equipamentos/meus`: qualquer autenticado.
   - `/equipamentos`, `/equipamentos/novo`, `/equipamentos/:id/editar`, `/usuarios`, `/usuarios/novo`, `/usuarios/:id/editar`: sob `<AdminRoute />`.

### Bugs encontrados e corrigidos durante o desenvolvimento

- **`useMeusEquipamentos` quebrava com `data.map is not a function`** ao logar como qualquer usuário com equipamentos atribuídos. Backend retorna `Page<EquipamentoResponse>`, hook tipava como array. Corrigido: passa `size: 100`, extrai `.content`. Bug fix aplicado no fim da sessão.

### Validado nesta janela

- `docker exec domine-frontend npx tsc --noEmit` → sem erros após cada bloco.
- Smoke test curl: `/auth/login`, `/chamados/dashboard`, `/equipamentos`, `/usuarios`, `/equipamentos/meus` retornaram 200 com token admin/marina.
- Vite HMR aplicou todas as mudanças sem erros; novas deps otimizadas automaticamente.
- 13 cards `[S4]+[S5]` movidos pra REVISÃO no Trello com comentários técnicos de implementação.

## 4. Estado atual

**Funcionando:**
- 3 containers Domine de pé. Frontend em `http://localhost:5173`.
- Fluxos completos:
  - COMUM: login → dashboard com KPIs → abrir novo chamado → ver detalhe → comentar → ver meus equipamentos.
  - ADMIN: login → dashboard agregado → lista de chamados com filtros → detalhe → mudar status / atribuir técnico → CRUDs de equipamentos e usuários com soft delete confirmado.
- Typecheck limpo. Sem warnings de unused.

**Não validado / pendente:**
- **Validação visual no browser** pelo usuário (objeto da REVISÃO no Trello).
- **Sprint 6** (docs, README, diagramas, apresentação) e **Sprint 7** (UI design) seguem no BACKLOG.
- Nenhum commit Git ainda — usuário ainda não autorizou.
- Sem testes E2E (Sprint 6 cobre um cenário de smoke).

**Trello no fim da sessão:**
- 6 cards `[S0]` + 11 cards `[S1]` + 12 cards `[S2]` + 7 cards `[S3]` + 6 cards `[S4]` + 4 cards `[S5]` = **46 cards em REVISÃO**.
- 5 cards `[S6]` (docs/apresentação) no BACKLOG.
- 10 cards `[S7]` (UI design, criados nesta sessão) no BACKLOG: #111 a #120.
- CONCLUÍDO ainda vazio.

## 5. Próximos passos

1. **Validar Sprints 3, 4 e 5 no browser**:
   - Login admin (`admin@domine.com.br / admin123`) e COMUM (`marina@domine.com.br / senha123`).
   - Conferir sidebar mudando por perfil.
   - Abrir um chamado como Marina → admin atender → admin atribuir técnico → admin mudar status → ver evento aparecer no histórico.
   - CRUDs de Equipamento e Usuário como admin, incluindo dialog de confirmação.
   - Tentar acessar `/usuarios` como Marina (deve redirecionar pra `/dashboard`).
   - Olhar `/equipamentos/meus` como Marina (deve listar PAT-0001).
2. **Quando aprovar, mover cards `[S3]`, `[S4]` e `[S5]` de REVISÃO → CONCLUÍDO** (45 cards no total se incluir Sprints 0 e 1).
3. **Sugerir primeiro commit Git** (ainda pendente desde a Sprint 0):
   ```bash
   cd /Users/igormoreira/dev/freela/domine
   git add .
   git commit -m "feat: Sprints 0-5 — backend completo + frontend ponta a ponta"
   ```
4. **Escolher próxima sprint**:
   - **Sprint 6 (docs/apresentação)**: 5 cards no BACKLOG (`[S6]` POO, estruturas de dados, UML/relacional, README final, E2E + slides).
   - **Sprint 7 (UI design)**: 10 cards no BACKLOG (`[S7]` design tokens, tipografia, polimento de telas, animações, responsividade mobile, 404+Perfil, acessibilidade).
   - Recomendação: ir **Sprint 7 antes de Sprint 6**, porque os screenshots/GIFs da Sprint 6 ficam muito mais vendáveis depois do polimento visual.

## 6. Perguntas em aberto

- **`useAdmins()` está duplicado** entre `lib/chamados.ts` (Sprint 4 original) e `lib/usuarios.ts` (Sprint 5). A versão final em `lib/usuarios.ts` é a que importa. Posso remover a versão antiga em `chamados.ts` no Sprint 6 ou 7 — está sem uso hoje porque o `ChamadoDetalhe.tsx` importa de `lib/usuarios` já. **Pendência de limpeza.**
- **Filtros do `/usuarios` não foram implementados no frontend** — listagem usa só paginação, sem filtros por perfil/ativo (backend também ignora, como diz a perguntas-em-aberto do handoff Sprint 2). Aceitável pra escopo acadêmico.
- **`PUT /usuarios/{id}` aceita `perfil` e `ativo` opcionais** — o `UsuarioEditar` envia ambos sempre. Se a backend dropar suporte ao perfil opcional no futuro, o front segue funcionando porque manda valor não-null.
- **Mobile**: a UI atual não está bem em telas <md (tabelas estouram, sidebar de 240px sempre fixa). Coberto na Sprint 7 #118.
- **Tela 404**: hoje qualquer rota desconhecida redireciona pra `/dashboard`. Coberto na Sprint 7 #119.
- **Tela "Minha conta"**: dropdown tem item disabled. Coberto na Sprint 7 #119.
- **Acessibilidade**: focus rings inconsistentes em alguns botões custom, contraste do `text-mute` em ítem desabilitado dá pra melhorar. Coberto na Sprint 7 #120.

## 7. Artefatos relevantes

### Estrutura criada / modificada nesta janela

```
frontend/src/
├── App.tsx                                       (rotas novas + Toaster + AdminRoute)
├── components/
│   ├── AdminRoute.tsx                            (NOVO Sprint 5)
│   ├── ConfirmDialog.tsx                         (NOVO Sprint 5)
│   ├── EmptyState.tsx                            (NOVO Sprint 4)
│   ├── LoadingSkeleton.tsx                       (NOVO Sprint 4)
│   ├── PrioridadeBadge.tsx                       (NOVO Sprint 4)
│   ├── StatusBadge.tsx                           (NOVO Sprint 4)
│   ├── PrivateRoute.tsx                          (Sprint 3)
│   ├── Logo.tsx                                  (Sprint 3)
│   ├── auth-divider.tsx                          (Sprint 3)
│   ├── layout/                                   (Sprint 3)
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ui/                                       (shadcn primitives, Sprint 3)
├── lib/
│   ├── api.ts                                    (Sprint 3)
│   ├── auth.ts                                   (Sprint 3)
│   ├── utils.ts                                  (Sprint 3)
│   ├── format.ts                                 (NOVO Sprint 4)
│   ├── chamados.ts                               (NOVO Sprint 4)
│   ├── equipamentos.ts                           (Sprint 4, estendido Sprint 5)
│   └── usuarios.ts                               (Sprint 4, estendido Sprint 5)
├── pages/
│   ├── Login.tsx                                 (Sprint 3, alert→toast nesta janela)
│   ├── Dashboard.tsx                             (reescrito Sprint 4)
│   ├── ChamadosLista.tsx                         (NOVO Sprint 4)
│   ├── ChamadoNovo.tsx                           (NOVO Sprint 4)
│   ├── ChamadoDetalhe.tsx                        (NOVO Sprint 4)
│   ├── EquipamentosLista.tsx                     (NOVO Sprint 5)
│   ├── MeusEquipamentos.tsx                      (NOVO Sprint 5)
│   ├── EquipamentoForm.tsx                       (NOVO Sprint 5)
│   ├── UsuariosLista.tsx                         (NOVO Sprint 5)
│   └── UsuarioForm.tsx                           (NOVO Sprint 5)
└── types/index.ts                                (estendido Sprint 4)
```

### Mapa de rotas após Sprint 5

| Path | Acesso | Componente |
|---|---|---|
| `/login` | público (redirect se logado) | `<Login>` |
| `/dashboard` | autenticado | `<Dashboard>` (discrimina perfil) |
| `/chamados` | autenticado (COMUM vê só os seus) | `<ChamadosLista>` |
| `/chamados/novo` | autenticado | `<ChamadoNovo>` |
| `/chamados/:id` | dono ou ADMIN | `<ChamadoDetalhe>` |
| `/equipamentos/meus` | autenticado | `<MeusEquipamentos>` |
| `/equipamentos` | ADMIN | `<EquipamentosLista>` |
| `/equipamentos/novo` | ADMIN | `<EquipamentoForm>` |
| `/equipamentos/:id/editar` | ADMIN | `<EquipamentoForm>` |
| `/usuarios` | ADMIN | `<UsuariosLista>` |
| `/usuarios/novo` | ADMIN | `<UsuarioForm>` |
| `/usuarios/:id/editar` | ADMIN | `<UsuarioForm>` |
| `*` | qualquer | redirect `/dashboard` |

### Hooks de dados disponíveis

- **Chamados** (`lib/chamados.ts`): `useChamados`, `useChamado`, `useHistoricoChamado`, `useDashboard`, `useCriarChamado`, `useAtualizarStatus(id)`, `useAtribuirTecnico(id)`, `useAdicionarComentario(id)`.
- **Equipamentos** (`lib/equipamentos.ts`): `useEquipamentos`, `useEquipamento`, `useMeusEquipamentos`, `useEquipamentosLista`, `useCriarEquipamento`, `useAtualizarEquipamento(id)`, `useExcluirEquipamento`.
- **Usuários** (`lib/usuarios.ts`): `useUsuarios`, `useUsuario`, `useUsuariosLista`, `useAdmins`, `useCriarUsuario`, `useAtualizarUsuario(id)`, `useDesativarUsuario`.

### Comandos úteis

```bash
# Subir tudo
cd /Users/igormoreira/dev/freela/domine && docker compose up -d

# Hot reload cobre tudo em src/; package.json muda → rebuild:
docker compose up --build -d frontend

# Typecheck rápido
docker exec domine-frontend npx tsc --noEmit

# Logs ao vivo
docker logs domine-frontend --tail 50 -f

# Reset do banco (apaga volume + reseed)
docker compose down -v && docker compose up --build -d
```

### Links

- **Trello**: https://trello.com/b/hfqG2kcO/projeto-terceiro-semestre
- **Frontend**: http://localhost:5173
- **Backend Swagger**: http://localhost:8080/api/v1/swagger-ui.html

## 8. Instruções pra próxima sessão

- **Tom**: técnico-direto, em português, sem emojis salvo se o usuário usar.
- **Confirmar antes de**: commit git, force push, deletar volumes, instalar pacotes na host.
- **Não precisa confirmar pra**: editar arquivos, rebuild Docker, mover cards Trello dentro do workflow, rodar curl/typecheck.
- **Trello workflow**: implementação → EM ANDAMENTO; terminou → REVISÃO; usuário valida → CONCLUÍDO. Nunca pular pra CONCLUÍDO direto.
- **Armadilhas observadas nesta janela:**
  - Endpoints `/.../meus` retornam `Page<T>` no Domine (não array). Sempre extrair `.content`.
  - `npx shadcn add` não instala `class-variance-authority`/`tailwind-merge`/`tailwindcss-animate` — adicionar manualmente quando vier outro componente que exija (Sprint 3 já cobriu).
  - Mudanças em `package.json` dentro do container precisam ser sincronizadas pra host (`docker exec cat ... > frontend/package.json`).
  - `placeholderData: (prev) => prev` no useQuery evita flash de skeleton em paginação/refetch — usar nas listas.
  - `<AdminRoute />` no React Router 6 precisa ser uma `Route` pai com `element={<AdminRoute />}` e filhos via Outlet. Já está assim.
  - `react-hook-form` com Select shadcn: registrar manualmente via `register('campo')` + `setValue('campo', ...)` em `onValueChange`. Watch + setValue é o padrão neste projeto.
- **POO acadêmica até aqui (sem mudanças nas Sprints 4 e 5 — são frontend):**
  - Sprint 1: Herança, Encapsulamento, Abstração.
  - Sprint 2: Polimorfismo (Notificavel), reforço de Encapsulamento e Abstração.
  - Sprint 6 documenta tudo (cards #106 e #107 no BACKLOG).
- **Estruturas de dados acadêmicas em uso no frontend:**
  - `List<>` (Array TS): listagens paginadas de chamados/equipamentos/usuários, comentários, histórico, timeline mesclada.
  - `Map<>` (Record<string, number>): `DashboardResponse.porPrioridade`, `porCategoria`, renderizados como barras horizontais.
- **Próxima sprint recomendada** = **Sprint 7 (UI design)**: 10 cards no BACKLOG, escolhidos pra deixar o produto apresentável antes da Sprint 6 (docs + screenshots/GIFs).
- **Spec original** está na primeira mensagem da thread original. Fonte de verdade.
