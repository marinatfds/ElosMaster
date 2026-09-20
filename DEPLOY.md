# Guia de cutover — ElosMaster

Checklist para colocar o novo app (Vite + Hono + Postgres) no ar e aposentar o app antigo
(CRA + Koa + SQL Server, agora em `legacy/`). As partes de infraestrutura real (hospedagem,
DNS, certificado) dependem do seu provedor — o que está aqui foi pensado pra ser adaptável,
mas só a etapa de build/run local foi de fato testada nesta sessão.

## 1. Pré-requisitos no servidor de produção

- Node.js 22 LTS (ou o runtime Docker, se for esse o caminho escolhido).
- PostgreSQL 16+ acessível (gerenciado ou self-hosted).
- Nenhum bloqueio na porta usada pelo Postgres.

## 2. Variáveis de ambiente

Copie `apps/api/.env.example` para `apps/api/.env` (ou configure via secrets do seu provedor)
e preencha:

| Variável | Observação |
|---|---|
| `DATABASE_URL` | Postgres de produção, não o de dev |
| `JWT_SECRET` | gerar um valor novo e aleatório (`openssl rand -hex 32`), nunca reaproveitar o de dev |
| `CORS_ORIGIN` | a URL real do front em produção (ex: `https://app.seudominio.com`) |
| `LEGACY_MSSQL_CONNECTION_STRING` | só necessário na hora de rodar a migração (etapa 3) |

Para o front (`apps/web`), `VITE_API_URL` precisa apontar para a URL real da API — como é lida
em build-time pelo Vite, isso significa **buildar o front de novo** se essa URL mudar.

## 3. Migração de dados (Fase 7)

Rodar **uma vez**, a partir de uma máquina com acesso tanto ao SQL Server antigo quanto ao
Postgres novo:

```bash
cd apps/api
npm run db:migrate          # aplica o schema no Postgres novo, se ainda não aplicado
npm run db:seed-admin -- "Nome" email@dominio.com "senha-temporaria"   # se ainda não existir admin
npm run migrate:mssql -- --dry-run   # confira o resumo antes de gravar de verdade
npm run migrate:mssql                # roda de verdade
```

`LEGACY_MSSQL_CONNECTION_STRING` usa formato ADO.NET, não uma URL `mssql://`:
```
Server=host;Database=ElosMaster;User Id=usuario;Password=senha;Encrypt=false;TrustServerCertificate=true
```
(ajuste `Encrypt`/`TrustServerCertificate` conforme a configuração de TLS do SQL Server de origem.)

Depois de migrar, confira as contagens impressas no resumo contra o que você espera do banco
antigo. `Tests`/`Presence` não são migrados automaticamente (ver aviso do script) — se houver
dado relevante lá, precisa ser tratado manualmente.

## 4. Build e execução

**Caminho testado nesta sessão** (Node puro, sem Docker):

```bash
npm install         # roda build:shared automaticamente via postinstall
npm run build        # builda shared + web + api
node apps/api/dist/index.js     # sobe a API
# sirva apps/web/dist com qualquer servidor estático (nginx, Caddy, etc.)
```

**Caminho via Docker** (`Dockerfile`s e `docker-compose.yml` na raiz — escritos com cuidado,
mas não testados neste ambiente por falta de Docker disponível; valide antes de confiar em
produção, principalmente a parte do Chromium/Puppeteer na imagem da API):

```bash
POSTGRES_PASSWORD=... JWT_SECRET=... WEB_ORIGIN=https://app... API_ORIGIN=https://api... \
  docker compose up -d --build
```

## 5. Checklist de fumaça pós-deploy

- [ ] `GET /health` na API responde `{"ok":true}`
- [ ] Login funciona para os 3 papéis (admin, coordinator, volunteer)
- [ ] Menu mostra os itens certos por papel
- [ ] Criar um alerta e ver a notificação chegar em tempo real (SSE) em outra sessão
- [ ] Gerar boletim e extrato em PDF (conferir que abrem e têm acentuação correta)
- [ ] Cookies de sessão funcionam entre o domínio do front e o da API (checar `CORS_ORIGIN`
      e `SameSite`/`Secure` se front e API estiverem em domínios diferentes)

## 6. Rollback

O app antigo continua intacto em `legacy/client` e `legacy/server` até você confirmar que o
novo está estável — nada foi apagado, só movido. Se precisar voltar atrás, é reapontar o
domínio/proxy pro processo antigo enquanto investiga o problema no novo.
