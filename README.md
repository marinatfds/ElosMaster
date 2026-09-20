# ElosMaster

Sistema de gestão para a equipe/academia ElosMaster: alunos, presença, simulados, alertas,
tesouraria, relatórios em PDF, notificações em tempo real.

Monorepo (npm workspaces):

```
apps/
  web/        Vite + React + MUI — front, com rotas protegidas por papel
  api/        Hono + Drizzle + PostgreSQL — back, com JWT + RBAC + Zod
packages/
  shared/     schemas Zod e tipos TypeScript compartilhados entre web e api
legacy/       app anterior (CRA + Koa + SQL Server), arquivado — ver legacy/README.md
```

Três papéis de usuário: `admin`, `coordinator`, `volunteer` — cada um vê um subconjunto
diferente de telas (ver `apps/web/src/components/Sidebar.tsx` para o mapeamento completo).

## Pré-requisitos

- Node.js 22 (LTS)
- PostgreSQL 16+ rodando localmente (ou acessível via `DATABASE_URL`)

## Configuração inicial

```bash
npm install                 # instala tudo e builda packages/shared (postinstall)

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# edite os dois .env com suas credenciais locais

cd apps/api
npm run db:migrate                              # cria as tabelas no Postgres
npm run db:seed-admin -- "Seu Nome" voce@exemplo.com senha123   # primeiro usuário admin
```

## Desenvolvimento

Em dois terminais, a partir da raiz do repositório:

```bash
npm run dev:api    # http://localhost:8787
npm run dev:web    # http://localhost:5173
```

Se for editar `packages/shared` ativamente, rode `npm run dev:shared` num terceiro terminal
(compila em modo watch) — sem isso, mudanças lá só aparecem depois de um `npm run build:shared`
manual, porque o `api`/`web` consomem o `dist/` compilado, não o TypeScript fonte diretamente.

## Build de produção

```bash
npm run build       # builda shared, web e api, nessa ordem
node apps/api/dist/index.js                  # sobe a API
# sirva apps/web/dist com qualquer servidor estático
```

Veja [`DEPLOY.md`](./DEPLOY.md) para o checklist completo de cutover (variáveis de ambiente de
produção, migração de dados do SQL Server antigo, Docker).

## Funcionalidades por fase

1. Autenticação (JWT em cookie httpOnly) + RBAC por papel
2. Alertas, Equipe, Tesouraria, Alunos — CRUD com validação Zod de ponta a ponta
3. Simulados (notas) e Presença, com visão restrita para `volunteer`
4. Notificações em tempo real (SSE) com persistência, sino no menu
5. Relatórios em PDF (boletim do aluno, extrato financeiro) via Puppeteer
6. Script de migração de dados do SQL Server antigo (`apps/api/scripts/migrate-from-mssql.ts`)
