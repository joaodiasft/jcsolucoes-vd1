# 🚀 Instruções de Deploy - Vercel

## 1. Preparação

### 1.1. Instale a Vercel CLI (opcional, mas recomendado)
```bash
npm install -g vercel
```

### 1.2. Faça login na Vercel
```bash
vercel login
```

## 2. Deploy

### Opção A: Via GitHub (Recomendado)

1. Acesse https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione o repositório: `joaodiasft/jcsolucoes-vd1`
4. Configure o projeto:
   - **Framework**: Next.js (detectado automaticamente)
   - **Root Directory**: `./` (padrão)
   - **Build Command**: `npm run build`
   - **Output Directory**: (deixe em branco)

5. **Adicione as Variáveis de Ambiente:**

```
DATABASE_URL=postgresql://neondb_owner:npg_a9FNS7bdkGwD@ep-dark-salad-acjgx20x-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
TOKEN_SECRET=sua-chave-secreta-aleatoria-mude-isso
TOKEN_EXPIRY_HOURS=24
CHAVE_PIX=jcsolucoesgo@gmail.com
NOME_BENEFICIARIO=JC Soluções
CIDADE_BENEFICIARIO=Goiânia
BENEFICIARIO_CHAVE=EMAIL
WHATSAPP_NUMERO=5562999999999
NEXT_PUBLIC_APP_URL=https://jcsolucoes-vd1.vercel.app
NODE_ENV=production
```

6. Clique em "Deploy"

### Opção B: Via CLI

```bash
# No diretório do projeto
vercel --prod
```

## 3. Pós-Deploy

### 3.1. Testar o Sistema

1. **Acesse o Dashboard:**
   - URL: `https://jcsolucoes-vd1.vercel.app/dashboard`
   - Cadastre uma nova dívida

2. **Gerar Link para Devedor:**
   - No dashboard, clique em "Nova Dívida"
   - Preencha os dados do devedor
   - Gere o link único
   - Envie para o devedor

3. **Testar como Devedor:**
   - Acesse o link recebido
   - Verifique os dados da dívida
   - Teste o botão "Copiar Chave PIX"
   - Teste o botão "Enviar Comprovante"

### 3.2. Ajustes de Segurança

**IMPORTANTE:** Antes de usar em produção:

1. **Altere a TOKEN_SECRET** no `.env` da Vercel:
   - Gere uma nova chave: `openssl rand -hex 32`
   - Substitua no ambiente

2. **Configure o WhatsApp:**
   - Atualize `WHATSAPP_NUMERO` com seu número real
   - Formato: `55` + DDD + número (apenas dígitos)

3. **Ajuste a Chave PIX:**
   - Atualize `CHAVE_PIX` com sua chave real
   - Pode ser email, telefone, CPF ou chave aleatória

## 4. Monitoramento

### Logs da Vercel
- Acesse: https://vercel.com/joaodiasft/jcsolucoes-vd1
- Aba "Logs" para ver erros e requisições

### Banco de Dados (Neon)
- Acesse: https://console.neon.tech
- Verifique a conexão e dados

## 5. Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Verificar migrations
npx prisma migrate dev

# Resetar banco (cuidado!)
npx prisma migrate reset

# Estudar dados do banco
npx prisma studio
```

## 6. Solução de Problemas

### Erro: "Database connection failed"
- Verifique se `DATABASE_URL` está correto no `.env` da Vercel
- Confirme que o Neon permite conexões da Vercel (IP allowlist)

### Erro: "Token inválido"
- Verifique se o token foi gerado corretamente
- Tokens expiram em 24 horas por padrão

### Erro: "PIX não copia"
- Navegadores requerem HTTPS para clipboard API
- A Vercel já fornece HTTPS automaticamente

## 7. Próximos Passos (Opcional)

- [ ] Adicionar autenticação de dois fatores
- [ ] Implementar baixa automática de pagamentos
- [ ] Adicionar envio de SMS/Email
- [ ] Criar relatórios em PDF
- [ ] Dashboard com gráficos
- [ ] Exportação de dados (Excel/CSV)

## 8. Links Úteis

- **Repositório**: https://github.com/joaodiasft/jcsolucoes-vd1
- **Vercel Dashboard**: https://vercel.com/joaodiasft/jcsolucoes-vd1
- **Neon Console**: https://console.neon.tech
- **Documentação Next.js**: https://nextjs.org/docs
- **Documentação Prisma**: https://pris.ly/d

---

**Dúvidas?** Entre em contato: jcsolucoesgo@gmail.com