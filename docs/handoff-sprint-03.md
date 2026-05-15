# Handoff: Sprint 3 — Frontend Setup + Layout Autenticado + shadcn/ui

**Data:** 2026-05-15
**Status:** Em revisão (aguardando validação manual do usuário no Trello — 7 cards `[S3]` em REVISÃO)

## 1. Objetivo

Subir o frontend Vite + React + TS do **Domine** ponta-a-ponta: autenticação JWT via tela de Login, contexto/persistência, Axios com interceptor, React Router com guards, layout autenticado (sidebar dinâmica por perfil + header com dropdown) e biblioteca **shadcn/ui** institucionalizada com tokens semânticos. É a base sobre a qual a Sprint 4 (telas de Chamados) e Sprint 5 (Equipamentos + Usuários) vão construir.

## 2. Contexto essencial

- **Stack frontend**: Vite 5 · React 18 · TypeScript strict · TailwindCSS 3 · TanStack Query 5 · Axios · React Router 6 · React Hook Form + Zod · Lucide React · **shadcn/ui** (Radix UI primitives) · Sonner (toasts).
- **Container `domine-frontend`** (Node 22-alpine) roda `vite --host 0.0.0.0` em `:5173`.
- **Volumes do docker-compose** (mudam ao vivo, sem rebuild): `src/`, `public/`, `index.html`, `tailwind.config.js`, `postcss.config.js`, `vite.config.ts`, `tsconfig.json`, `components.json`. `package.json` e `package-lock.json` **não estão em volume** — adicionar/remover deps exige `docker compose up --build -d frontend`.
- **Decisões técnicas tomadas:**
  - **Voltagent palette + always-dark**: dark mode permanente. Tokens shadcn (`--background`, `--foreground`, `--primary` etc) foram mapeados pra paleta voltagent (`#101010 canvas`, `#f2f2f2 ink`, `#2563eb primary`) em `src/index.css`.
  - **Tokens custom + tokens shadcn coexistem** em `tailwind.config.js`: classes fixas (`bg-canvas`, `text-ink`, `border-hairline`) ao lado de tokens via CSS vars (`bg-background`, `text-foreground`, `border-border`). Usar custom pro layout do Domine, shadcn pros componentes primitives.
  - **`cn(...)` em `lib/utils.ts`** faz `twMerge(clsx(...))` — padrão shadcn.
  - **shadcn `components.json`**: baseColor `neutral`, `cssVariables: true`, prefix vazio, alias `@/*` → `src/*`, `@/components/ui` pra primitives, lucide como icon library.
  - **`AuthContext`** mantém `usuario` em state (hidratado de `localStorage` no init); `lib/auth.ts` (`authStorage`) é a fonte única de persistência. `isAuthenticated` deriva de `!!usuario`.
  - **`lib/api.ts`** (Axios): interceptor de request anexa `Authorization: Bearer <token>` a cada chamada; interceptor de response, em 401, limpa storage e força navegação pra `/login`. `baseURL` lê `VITE_API_URL` (vem do compose: `http://localhost:8080/api/v1`).
  - **`PrivateRoute`** redireciona pra `/login` quando não autenticado e preserva `from` em `location.state` (pra voltar pós-login no futuro). `AdminRoute` previsto no card 92 **ainda não implementado** — Sprint 4/5 vai trazer telas que demandam essa proteção.
  - **`Login.tsx`** usa um componente custom `SignInPage` (em `src/components/ui/sign-in.tsx`, com vídeo de fundo `/video-login/...`, testimonials, animações CSS). Mantido como tela hero do projeto — não foi substituído por `Card` shadcn por escolha estética.
  - **Sidebar dinâmica por perfil** (`src/components/layout/Sidebar.tsx`):
    - COMUM: Dashboard, Meus chamados, Meus equipamentos, Novo chamado
    - ADMIN: Dashboard, Chamados, Equipamentos, Usuários
    - Active state via `NavLink` callback (`isActive` → `bg-primary/10 text-primary`).
  - **`Header.tsx`** com `DropdownMenu` shadcn + `Avatar` com fallback de iniciais (extraídas do nome). Dropdown tem "Minha conta" (disabled, placeholder) e "Sair" (destrutivo, chama `logout()`).
  - **`AppLayout.tsx`** = flex com Sidebar (240px fixa) + coluna `{Header + Main}`. Main usa `max-w-7xl` centralizada. Outlet do React Router renderiza páginas filhas.
- **Restrições:**
  - Dark-only por design — sem toggle de tema (apesar de `next-themes` ter sido instalado como dep transitiva do `sonner`).
  - Sem testes Vitest/RTL (não pedido).
  - Sem commits Git ainda.
  - `package.json`/`package-lock.json` foram editados via `docker exec npm install` e depois sincronizados pra host com `docker exec cat /app/package.json > frontend/package.json`. Mantém-se assim até alguém rodar `--build`.

## 3. O que já foi feito

### Sprints 0–2 (concluídas em sessões anteriores, todas em REVISÃO no Trello aguardando validação)
- Sprint 0: scaffold monorepo, Dockerfiles, docker-compose, README.
- Sprint 1: backend Spring Boot 3.3 com JWT, Usuario, GlobalExceptionHandler, Swagger, DataSeeder com 4 usuários.
- Sprint 2: CRUDs Usuario/Equipamento/Chamado/Comentario/Historico, interface `Notificavel`, dashboard, seed completo. 35 arquivos Java novos.

### Sprint 3 (concluída nesta sessão; cards em REVISÃO no Trello)

**Arquivos criados / modificados** (a partir do Sprint 0 placeholder):

1. **Setup (cards 89, 90, 92, 93, 94 — implementados em sessão anterior, esta sessão revisitou):**
   - `frontend/package.json` — deps de runtime (axios, tanstack-query, react-router-dom, react-hook-form, zod, lucide-react, clsx) + dev (vite, tailwindcss, typescript, postcss, autoprefixer).
   - `frontend/tsconfig.json` — strict, paths `@/* → src/*`, jsx react-jsx.
   - `frontend/vite.config.ts` — alias `@` → `src`, host `0.0.0.0`, porta 5173.
   - `frontend/tailwind.config.js` — paleta voltagent + tokens shadcn via CSS vars + Inter sans + radius custom.
   - `frontend/postcss.config.js`, `frontend/index.html`, `frontend/src/index.css` (com `@tailwind` directives + CSS vars + keyframes custom de entry animations).
   - `frontend/src/main.tsx` — root com `BrowserRouter` + `QueryClientProvider` + `AuthProvider`.
   - `frontend/src/App.tsx` — rotas `/login`, `/dashboard`, com `PrivateRoute` envolvendo `AppLayout` → `<Dashboard />`. Catch-all `*` → `/dashboard`.
   - `frontend/src/types/index.ts` — `PerfilUsuario`, `UsuarioMin`, `LoginRequest`, `LoginResponse`, `ErroResponse`.
   - `frontend/src/lib/api.ts` — Axios com interceptors (auth bearer + 401 → logout).
   - `frontend/src/lib/auth.ts` — `authStorage` (localStorage wrapper).
   - `frontend/src/lib/utils.ts` — `cn(twMerge(clsx(...)))`.
   - `frontend/src/contexts/AuthContext.tsx` — `AuthProvider` + `useAuth()`.
   - `frontend/src/components/PrivateRoute.tsx` — guard via Outlet.
   - `frontend/src/components/Logo.tsx`, `frontend/src/components/auth-divider.tsx`.
   - `frontend/src/components/ui/sign-in.tsx`, `input-group.tsx`, `decor-icon.tsx` — composição visual da tela de Login (vídeo, animações, OAuth placeholder).
   - `frontend/src/pages/Login.tsx` — usa `SignInPage`, mutation TanStack Query → `POST /auth/login` → `login(token, usuario)` → navigate `/dashboard`.

2. **shadcn/ui (card 91 — implementado nesta sessão):**
   - **14 componentes oficiais** adicionados via `docker exec domine-frontend npx shadcn@latest add ...`:
     `button`, `input`, `label`, `card`, `badge`, `dialog`, `select`, `textarea`, `dropdown-menu`, `avatar`, `separator`, `tabs`, `table`, `sonner`. Todos em `src/components/ui/`.
   - **Deps novas no `package.json`**: `@radix-ui/react-{avatar,dialog,dropdown-menu,label,select,separator,slot,tabs}`, `class-variance-authority`, `tailwind-merge`, `tailwindcss-animate`, `sonner`, `next-themes`.
   - `tailwind.config.js` recebeu `plugin: tailwindcss-animate` + keyframes/animations `accordion-down/up` + `borderRadius.lg = var(--radius)`.
   - `src/lib/utils.ts` atualizado pra usar `twMerge`.
   - `src/vite-env.d.ts` criado (triple-slash do Vite) — destravou `import.meta.env` no `tsc --noEmit`.

3. **AppLayout (card 95 — implementado nesta sessão):**
   - `src/components/layout/AppLayout.tsx` — flex {Sidebar | coluna {Header + Main}}.
   - `src/components/layout/Sidebar.tsx` — 240px, Logo no topo, navegação `NavLink` com itens por perfil + rodapé "Perfil: ADMIN/COMUM".
   - `src/components/layout/Header.tsx` — nome + email + badge de perfil + `DropdownMenu` com `Avatar` (fallback iniciais) → Minha conta (disabled) / Sair (destructive).
   - `App.tsx` aninhou `Dashboard` dentro de `AppLayout`.
   - `pages/Dashboard.tsx` reescrito: removeu header próprio, usa `<Card>` shadcn pras métricas, mostra mensagem diferente por perfil.

### Validado nesta sessão
- `docker exec domine-frontend npx tsc --noEmit` → sem erros.
- `curl http://localhost:5173/` → HTTP 200.
- `curl POST /auth/login` admin → 200 com JWT (backend Sprint 1 não foi tocado).
- Vite HMR aplicou Tailwind config + utils + Dashboard + AppLayout sem erros nos logs do container.

## 4. Estado atual

**Funcionando:**
- 3 containers Domine de pé (db + backend Sprint 2 + frontend Sprint 3 com hot reload).
- Login admin (`admin@domine.com.br / admin123`) e COMUM (`marina@domine.com.br / senha123`) carregam dashboard com sidebar adequada ao perfil.
- Typecheck limpo (`tsc --noEmit`).
- Shadcn primitives prontos pra uso na Sprint 4 (button, card, dialog, dropdown, select, table etc).

**Não validado / pendente:**
- **Validação visual no browser** pelo usuário (objeto da REVISÃO no Trello).
- **`AdminRoute`** previsto na descrição do card 92 ainda não implementado — Sprint 4 ou 5 vai trazer telas onde é necessário (ex.: tela de Usuários, criar Equipamento).
- **`Toaster` (Sonner)** ainda não foi montado em `main.tsx` / `App.tsx`. Os componentes existem mas não renderizam toast nenhum porque nada os monta. **Sprint 4 deve montar isso** antes de usar mutations com feedback.
- **Login** ainda usa `alert()` em vez de toast Sonner. Pode aguardar Sprint 4 (junto com a montagem do `<Toaster />`).
- Nenhum consumo dos endpoints novos da Sprint 2 ainda — Sprint 4 vai trazer.

**Trello no fim da sessão:**
- 6 cards `[S0]` em REVISÃO (estado de sessões anteriores).
- 11 cards `[S1]` em REVISÃO (idem).
- 12 cards `[S2]` em REVISÃO (idem).
- 7 cards `[S3]` em REVISÃO (2 movidos nesta sessão: 91 e 95; 5 movidos no fim desta sessão: 89, 90, 92, 93, 94).
- 6 cards `[S4]` em EM ANDAMENTO (movidos no fim desta sessão).
- 4 cards `[S5]` + 5 cards `[S6]` em BACKLOG.
- CONCLUÍDO ainda vazio (validação manual do usuário pendente).

## 5. Próximos passos

1. **Aguardar usuário validar Sprint 3** no browser (`http://localhost:5173`): conferir login admin/comum, sidebar trocando de itens, dropdown Sair, dashboard renderizando dentro do AppLayout.
2. **Sugerir primeiro commit Git** (ainda não feito desde Sprint 0):
   ```bash
   cd /Users/igormoreira/dev/freela/domine
   git add .
   git commit -m "feat: Sprints 0-3 — scaffold, backend auth+domínio, frontend setup+layout"
   ```
3. **Iniciar Sprint 4** (6 cards já em EM ANDAMENTO):
   - **`StatusBadge` + `PrioridadeBadge`** reutilizáveis com cores semânticas (card 97).
   - **Tipos TS** dos enums (`StatusChamado`, `PrioridadeChamado`, `CategoriaChamado`) espelhando o backend + DTOs `ChamadoResponse`, `ComentarioResponse`, `HistoricoResponse`, `DashboardResponse`.
   - **`lib/chamados.ts`** com hooks TanStack Query (`useChamados`, `useChamado`, `useDashboard`, mutations `useCreateChamado`, `useUpdateStatus`, `useAtribuirTecnico`, `useAddComentario`).
   - **Dashboard COMUM + ADMIN** (card 96) consumindo `/chamados/dashboard` pra ADMIN; pra COMUM, consumir `/chamados` paginado e contar por status no client.
   - **Lista de Chamados** (card 98) — tabela shadcn com filtros (Select de status/prioridade/categoria), busca por título, paginação Spring (`page`, `size`).
   - **Detalhe de Chamado** (card 99) — layout 2 colunas, timeline misturando comentários + histórico ordenados por data, painel de ações ADMIN (mudar status, atribuir).
   - **Novo Chamado** (card 100) — form com `react-hook-form` + Zod, equipamento selecionável (combobox).
   - **Mutations + Empty/Loading states** (card 101) — `<Toaster />` montado, `Skeleton` shadcn, `EmptyState` reutilizável, invalidate de cache pós-mutação.
4. **Validar Sprint 4 via browser** (fluxo: criar chamado como Marina → admin atende → admin atribui técnico → admin muda status → marina vê histórico).
5. **Criar `handoff-sprint-04.md`** ao final.

## 6. Perguntas em aberto

- **`AdminRoute`** — implementar antes da Sprint 4 ou junto com a primeira tela admin-only? Mais barato implementar quando construir a tela de Usuários (Sprint 5).
- **Toast onde?** Sonner está instalado mas `<Toaster />` não está montado. Decisão: incluir no início da Sprint 4 (junto com primeira mutation) ou já adicionar agora em `App.tsx`? Sugerido: agora, pra deixar o `alert()` do Login pronto pra virar `toast.error()` no próximo passo.
- **`useAuth().usuario` pode ter dados stale** se o backend mudar perfil/ativo do usuário logado. Não é problema no escopo atual; documentar como limitação.
- **Sem testes E2E** — fluxo completo de login + navegação só é validado manualmente. Sprint 6 cobre isso (card 110).
- **Hot reload do Tailwind** funciona via volume desde a Sprint 2; novas classes shadcn já são detectadas porque `content: ['./src/**/*.{ts,tsx}']`.

## 7. Artefatos relevantes

### Estrutura criada nesta sprint

```
frontend/
├── components.json                              (já existia da S0/S1 — config shadcn)
├── tailwind.config.js                           (estendido nesta sprint: plugin animate + keyframes accordion + radius.lg)
├── tsconfig.json
├── vite.config.ts
├── postcss.config.js
├── package.json                                 (deps shadcn adicionadas)
├── package-lock.json
└── src/
    ├── main.tsx                                 (BrowserRouter + QueryClient + AuthProvider)
    ├── App.tsx                                  (rotas + AppLayout aninhado)
    ├── index.css                                (CSS vars shadcn + Inter + animações)
    ├── vite-env.d.ts                            (NOVO nesta sessão)
    ├── types/index.ts
    ├── lib/
    │   ├── api.ts                               (Axios + interceptors)
    │   ├── auth.ts                              (authStorage)
    │   └── utils.ts                             (cn → twMerge+clsx)
    ├── contexts/AuthContext.tsx
    ├── components/
    │   ├── Logo.tsx
    │   ├── auth-divider.tsx
    │   ├── PrivateRoute.tsx
    │   ├── layout/                              (NOVO nesta sessão)
    │   │   ├── AppLayout.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── Header.tsx
    │   └── ui/
    │       ├── sign-in.tsx                      (existente — hero login)
    │       ├── input-group.tsx                  (existente)
    │       ├── decor-icon.tsx                   (existente)
    │       └── (NOVOS — shadcn add nesta sessão):
    │           avatar.tsx, badge.tsx, button.tsx, card.tsx,
    │           dialog.tsx, dropdown-menu.tsx, input.tsx, label.tsx,
    │           select.tsx, separator.tsx, sonner.tsx, table.tsx,
    │           tabs.tsx, textarea.tsx
    └── pages/
        ├── Login.tsx
        └── Dashboard.tsx                        (reescrito pra usar AppLayout + Card shadcn)
```

### Rotas atuais

| Path | Acesso | Renderiza |
|---|---|---|
| `/login` | público (redireciona se já logado) | `<Login>` (SignInPage custom) |
| `/dashboard` | autenticado | `<AppLayout><Dashboard></AppLayout>` |
| `*` | qualquer | redirect `/dashboard` |

### Credenciais de teste

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

# Hot reload já cobre src/, tailwind, vite config, ts config, index.html, components.json.
# Mudou package.json? Precisa rebuild:
docker compose up --build -d frontend

# Adicionar mais componentes shadcn dentro do container:
docker exec domine-frontend npx --yes shadcn@latest add <componente>
# Depois sincronizar package.json/lock:
docker exec domine-frontend cat /app/package.json > frontend/package.json
docker exec domine-frontend cat /app/package-lock.json > frontend/package-lock.json

# Typecheck rápido
docker exec domine-frontend npx tsc --noEmit

# Logs do frontend
docker logs domine-frontend --tail 50 -f

# Reset total (apaga volume do db, força reseed)
docker compose down -v && docker compose up --build -d
```

### Links

- **Trello**: https://trello.com/b/hfqG2kcO/projeto-terceiro-semestre
- **Frontend**: http://localhost:5173
- **Backend Swagger**: http://localhost:8080/api/v1/swagger-ui.html

## 8. Instruções pra próxima sessão

- **Tom**: técnico-direto, em português, sem emojis salvo se o usuário usar.
- **Confirmar antes de**: commitar git, force push, mudar nome do projeto, mexer em configs globais, deletar dados/volumes, instalar pacotes na máquina hospedeira.
- **Não precisa confirmar pra**: criar/editar arquivos Java/TS, `docker exec npm install`, rebuild Docker, mover cards Trello dentro do workflow estabelecido, rodar curl.
- **Trello workflow**: implementação → EM ANDAMENTO; terminou → REVISÃO; usuário valida → CONCLUÍDO. Nunca pular pra CONCLUÍDO direto.
- **Armadilhas reais já observadas nesta sprint:**
  - `npx shadcn add` instala `@radix-ui/*` mas **não** instala `class-variance-authority`, `tailwind-merge`, nem `tailwindcss-animate` automaticamente — adicioná-los manualmente (foi feito).
  - `package.json` fica dentro do container — qualquer `npm install` via `docker exec` precisa ser sincronizado pra host com `cat > frontend/package.json`, senão se perde no próximo rebuild.
  - `tsc --noEmit` quebra com `import.meta.env` sem `vite-env.d.ts` — já está criado.
  - `Sonner` precisa de `<Toaster />` montado em `App.tsx` ou `main.tsx` pra funcionar; ainda não foi feito.
  - Componente custom `SignInPage` (Login) tem suas próprias animações em `index.css` — não remover essas classes (`animate-element`, `animate-slide-right`, `animate-testimonial`, `animate-delay-*`).
- **POO acadêmica até aqui:**
  - Sprint 1: Herança (`EntidadeBase`), Encapsulamento (`Usuario`), Abstração (`AuthService`).
  - Sprint 2: Polimorfismo (`Notificavel` em `Chamado` + `Equipamento`), reforço de Abstração (services com interface), Encapsulamento (`chamado.resolver()`, `chamado.alterarStatusPara()`, `equipamento.baixar()`).
  - **Sprint 3**: nada novo de POO acadêmica — foi setup de frontend. Sprint 4 não traz POO, é frontend puro.
- **Estruturas de dados acadêmicas previstas na Sprint 4:**
  - `List<>`: timeline (comentários + histórico), lista paginada de chamados.
  - `Map<>`: já existe no backend (`/chamados/dashboard.porPrioridade/Categoria`); frontend vai renderizar como cards/gráfico de barras.
- **Spec original** está na primeira mensagem da thread original ("Prompt para Claude Code — Sistema Domine"). É a fonte de verdade.
- **Próxima sprint óbvia** = **Sprint 4** (Chamados frontend). Cards já em EM ANDAMENTO no Trello.
