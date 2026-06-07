# Segredos com 1Password — JC Pagamentos

Este projeto usa **1Password CLI** (`op`) para gerar `config.local.js` sem expor segredos no código ou no chat.

## Pré-requisitos

1. Assinatura 1Password + app desktop instalado
2. [1Password CLI](https://developer.1password.com/docs/cli/get-started/) (`op`)
3. Integração CLI habilitada no app:
   - **Windows:** Settings → Developer → Integrate with 1Password CLI
   - Desbloqueie o app antes de rodar os scripts

## Criar item no 1Password

Crie um item **Login** ou **Secure Note** chamado `JCPagamentos` com estes campos:

| Campo | Descrição |
|-------|-----------|
| `storage_secret` | Mín. 32 caracteres — criptografia localStorage |
| `session_pepper` | Assinatura HMAC das sessões |
| `token_pepper` | Hash dos tokens de login |
| `admin_token_hash` | SHA-256 do token admin (`node scripts/hash-token.js TOKEN`) |
| `admin_nome` | Nome exibido no painel |
| `pix_email` | E-mail Pix |
| `pix_banco` | Nome do banco |
| `pix_nome` | Titular Pix |

Ajuste o vault/caminho em `config.local.op.tpl.js` (ex.: `op://Private/JCPagamentos/storage_secret`).

## Gerar config.local.js

**Windows (PowerShell):**

```powershell
cd sistemapagamentos
.\scripts\setup-secrets.ps1
```

**macOS / Linux:**

```bash
cd sistemapagamentos
chmod +x scripts/setup-secrets.sh
./scripts/setup-secrets.sh
```

**Manual:**

```bash
op signin
op inject -i config.local.op.tpl.js -o config.local.js -f
```

## GitHub Pages

O `config.local.js` **não vai para o GitHub**. Em produção estática:

- Use `config.example.js` com valores públicos, **ou**
- Gere `config.local.js` localmente antes do deploy manual, **ou**
- Use CI (GitHub Actions) com `OP_SERVICE_ACCOUNT_TOKEN` + `op inject` no pipeline

## Segurança

- Nunca cole segredos no chat, commits ou issues
- Prefira `op inject` / `op run` em vez de arquivos `.env` commitados
- Rotacione peppers se houver suspeita de vazamento
