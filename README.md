# JC Soluções — Sistema de Pagamentos

Portal de gestão de clientes, contratos e parcelas com login por token, dados criptografados no navegador e log de auditoria.

## Estrutura

```
sistemapagamentos/
├── index.html              # Login
├── admin.html              # Painel de gestão
├── cliente.html            # Portal do cliente
├── css/jcpag-theme.css     # Tema visual (Syne + Instrument Sans)
├── config.example.js       # Config base (commitar)
├── config.local.js         # Overrides locais (stub vazio ou gerado)
├── config.local.op.tpl.js  # Template 1Password (op inject)
├── docs/SECRETS-1PASSWORD.md
├── scripts/setup-secrets.ps1
└── js/                     # security, core, app
```

## Instalação local

```bash
npx serve .
# http://localhost:3000
```

## Segredos com 1Password (recomendado)

Veja [docs/SECRETS-1PASSWORD.md](docs/SECRETS-1PASSWORD.md).

**Windows:**

```powershell
.\scripts\setup-secrets.ps1
```

**Manual:**

```bash
op signin
op inject -i config.local.op.tpl.js -o config.local.js -f
```

## Configuração manual

1. Copie `config.local.example.js` → `config.local.js`
2. Altere `STORAGE_SECRET`, `SESSION_PEPPER`, `TOKEN_PEPPER`
3. Gere hash admin: `node scripts/hash-token.js SEU_TOKEN`
4. Nunca commite segredos reais

## Acesso

- **Gestão:** token via `ADMIN_TOKEN_HASH` (somente o responsável)
- **Cliente:** token gerado ao cadastrar no painel (exibido uma vez)

## GitHub Pages

1. Settings → Pages → branch `main`
2. Use `config.example.js` ou gere `config.local.js` com 1Password antes do deploy
3. Admin e cliente no **mesmo navegador** compartilham dados (localStorage)

## Segurança

Leia [SECURITY.md](SECURITY.md). Sistema front-end only — produção real exige backend.

## Licença

Uso interno JC Soluções.
