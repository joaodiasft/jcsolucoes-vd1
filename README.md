# JC Soluções — Sistema de Pagamentos

Portal de gestão de clientes, contratos e parcelas com login por token, dados criptografados no navegador e log de auditoria.

## Estrutura

```
sistemapagamentos/
├── index.html          # Login
├── admin.html          # Painel de gestão (acesso restrito)
├── cliente.html        # Portal do cliente
├── config.example.js   # Configuração base (commitar)
├── config.local.js     # Segredos locais (NÃO commitar)
├── js/security/        # ⚠️ NÃO EDITAR — criptografia e auth
├── js/core/            # Store criptografado + API
└── js/app/             # UI por página
```

## Instalação local

1. Clone o repositório
2. (Opcional) Copie a config local:
   ```bash
   cp config.local.example.js config.local.js
   ```
3. Abra `index.html` com um servidor estático (recomendado):
   ```bash
   npx serve .
   ```
4. Acesse `http://localhost:3000`

## Configuração para GitHub / produção

**Leia [SECURITY.md](SECURITY.md) antes de publicar.**

1. Copie `config.local.example.js` → `config.local.js`
2. Altere **todos** os segredos em `config.local.js`:
   - `STORAGE_SECRET` (mín. 32 caracteres)
   - `SESSION_PEPPER`
   - `TOKEN_PEPPER`
3. Gere hash do token de gestão:
   ```bash
   node scripts/hash-token.js SEU_TOKEN
   ```
   Cole o hash em `ADMIN_TOKEN_HASH` no `config.local.js`
4. **Nunca** commite `config.local.js` nem exponha tokens na interface

## Acesso

- **Gestão:** token configurado via `ADMIN_TOKEN_HASH` (somente o responsável)
- **Cliente:** token gerado ao cadastrar no painel de gestão (exibido uma vez ao criar)

Na primeira execução a base inicia vazia. Cadastre clientes pelo painel de gestão.

## Reset do sistema

No painel de gestão, botão **Reset** zera a base criptografada.  
Ou limpe no navegador: DevTools → Application → Local Storage.

## GitHub Pages

1. Settings → Pages → Source: branch `main`, pasta `/sistemapagamentos` (ou raiz)
2. Configure `config.local.js` **antes** do deploy em ambiente real
3. Use HTTPS (GitHub Pages já fornece)

## Limitações

Este projeto é **front-end only**. A validação real de permissões exige backend.  
Veja `SECURITY.md` para detalhes.

## Licença

Uso interno JC Soluções.
