# Domine — Sistema de Gestão de TI

> Projeto integrador do 3º semestre de ADS — ExpoTech 2026.

**Domine** (de "dominar a gestão") é uma aplicação web de gestão de TI que combina **helpdesk** (chamados) e **inventário** básico de equipamentos, com dois perfis de usuário (ADMIN e COMUM) e permissões distintas.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Java 21 · Spring Boot 3.3 · Spring Security · Spring Data JPA · JWT (jjwt) |
| Banco | PostgreSQL 16 |
| Frontend | React 18 · Vite · TypeScript · TailwindCSS · shadcn/ui · TanStack Query |
| Infra | Docker · Docker Compose |
| Build | Maven · npm |

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 24+
- [Docker Compose](https://docs.docker.com/compose/) v2+
- (Opcional para desenvolvimento local sem Docker) Java 21 + Maven 3.9 + Node 22

## Como rodar

### Modo desenvolvimento (recomendado no dia a dia)

```bash
git clone <url-do-repo>
cd domine
docker compose up
```

O Docker Compose carrega automaticamente o `docker-compose.override.yml`, que ativa **hot reload** no backend (Spring DevTools) e no frontend (Vite HMR). Após `git pull`, as alterações refletem nos containers em segundos, sem precisar de rebuild manual.

### Modo produção (apresentação / demo)

```bash
docker compose -f docker-compose.yml up --build
```

Ignora o override e roda os containers com o código congelado dentro das imagens, como um deploy real. Backend roda o `.jar` empacotado, frontend roda Vite dev server (substituir por nginx + build é trabalho futuro).

### Quando ainda é necessário rebuild mesmo em dev

- Adicionou dependência nova (`pom.xml` ou `package.json`).
- Alterou um `Dockerfile`.
- Alterou variáveis de ambiente no `docker-compose.yml`.

Nesses casos:

```bash
docker compose up --build
```

Após subir os containers:

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend (API) | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Postgres | `localhost:5432` (db: `domine`, user: `domine`, pass: `domine123`) |
| **pgweb** (cliente web do banco, estilo Supabase Studio) | http://localhost:8081 |

## Credenciais de teste

O `DataSeeder` popula o banco na primeira execução:

| Perfil | Email | Senha |
|---|---|---|
| ADMIN | `admin@domine.com.br` | `admin123` |
| COMUM | `marina@domine.com.br` | `senha123` |
| COMUM | `carlos@domine.com.br` | `senha123` |
| COMUM | `joao@domine.com.br` | `senha123` |

## Estrutura do projeto

```
domine/
├── backend/                  Spring Boot API
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/br/com/domine/gestaoti/
│       ├── config/           Security, JWT, CORS, OpenAPI, Seed
│       ├── domain/           Feature packages
│       │   ├── auth/
│       │   ├── usuario/
│       │   ├── equipamento/
│       │   └── chamado/
│       ├── enums/
│       └── exception/
├── frontend/                 Vite + React + TS
│   ├── package.json
│   ├── Dockerfile
│   └── src/
├── docker-compose.yml
└── README.md
```

## Equipe

| Integrante | R.A. | Área |
|---|---|---|
| Vinicios Reis | 137024 | Banco de Dados |
| Raul Justos | 164026 | Front-End |
| Gabriel Pereira | 155802 | Back-End |
| Igor Moreira | — | Coordenação / Full-stack |
| Gustavo Braga | — | — |
| Arthur Oliveira Ribeiro | — | — |

## Gerenciamento

Acompanhamento do projeto via Trello: **Projeto Terceiro semestre**
- Sprints organizadas em PLANEJAMENTO
- Tarefas distribuídas no BACKLOG com prefixo `[Sx]` e labels por área
- Fluxo Kanban: BACKLOG → PARA FAZER → EM ANDAMENTO → REVISÃO → CONCLUÍDO
