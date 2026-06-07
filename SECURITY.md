# Política de Segurança — JC Pagamentos

## ⚠️ Aviso importante

Este sistema roda **inteiramente no navegador** (HTML + JavaScript).  
**Não confie no front-end para segurança real em produção.**

Qualquer pessoa com acesso ao DevTools pode:
- Inspecionar scripts carregados
- Tentar manipular `localStorage` ou `sessionStorage`
- Burlar validações se não houver servidor verificando cada ação

Para produção com dados reais, é **obrigatório** um backend (Node, Python, etc.) com:
- Autenticação no servidor
- Banco de dados protegido
- HTTPS
- Rate limiting e auditoria server-side

---

## O que este projeto implementa (defesa em profundidade no cliente)

| Camada | Implementação |
|--------|----------------|
| Dados em repouso | AES-256-GCM + PBKDF2 (310k iterações) via Web Crypto API |
| Tokens de login | Apenas **hash SHA-256 + pepper** persistido — nunca texto puro |
| Sessões | Assinatura HMAC-SHA256, expiração 8h, invalidação se adulterada |
| Brute force | Bloqueio 15 min após 5 tentativas falhas |
| Rotas | `JCPagGuard` valida sessão antes de renderizar admin/cliente |
| Mutações | API `JCPag.*` exige sessão admin/cliente válida no núcleo |
| Auditoria | Log com autor, ação, data e detalhes |
| CSP | Content-Security-Policy nas páginas HTML |

---

## Arquivos que NÃO devem ser editados

```
js/security/crypto.js   ← Criptografia
js/security/auth.js     ← Hash de tokens e sessões
js/security/guard.js    ← Proteção de rotas
js/core/store.js        ← Persistência criptografada
```

Alterações nesses arquivos podem **quebrar** criptografia, sessões e compatibilidade.  
Leia `js/security/LEIA-ME.txt`.

---

## Arquivos que você DEVE configurar (não commitar segredos)

| Arquivo | Commitar? | Função |
|---------|-----------|--------|
| `config.example.js` | ✅ Sim | Configuração base documentada |
| `config.local.js` | ✅ Sim (stub vazio) | Overrides locais opcionais |
| `config.local.example.js` | ✅ Sim | Modelo vazio |

---

## Checklist antes de publicar no GitHub

- [ ] `config.local.js` está no `.gitignore`
- [ ] `STORAGE_SECRET`, `SESSION_PEPPER`, `TOKEN_PEPPER` únicos e longos
- [ ] `ADMIN_TOKEN_HASH` gerado com `node scripts/hash-token.js`
- [ ] Nenhum token ou atalho de acesso exposto na interface
- [ ] Repositório **público** não contém e-mails/chaves Pix reais se forem sensíveis

---

## Checklist antes de uso com clientes reais

- [ ] Backend com API autenticada
- [ ] HTTPS obrigatório
- [ ] Tokens entregues por canal seguro (não por e-mail em texto puro)
- [ ] Backup dos dados fora do navegador
- [ ] Revisão periódica dos logs de auditoria

---

## Reportar vulnerabilidades

Contato: jcsolucoesgo@gmail.com

---

## Migração de versão anterior

A versão antiga (`jc-pagamentos-v1` em texto puro) é **ignorada**.  
O sistema inicia zerado com `jc-pag-encrypted-v2`.  
Use **Reset** no admin ou limpe o localStorage manualmente.
