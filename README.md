# Sistema de Dívidas - JC Soluções

Sistema de gestão de dívidas com pagamento via PIX e acompanhamento pelo WhatsApp.

## 🚀 Tecnologias

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Estilo:** TailwindCSS
- **Deploy:** Vercel

## 📋 Funcionalidades

### Admin
- [ ] Cadastrar dívidas
- [ ] Gerar links únicos para devedores
- [ ] Registrar pagamentos
- [ ] Visualizar histórico

### Devedor
- [ ] Consultar dívida via link único
- [ ] Visualizar valor total, pago e restante
- [ ] Copiar chave PIX
- [ ] Enviar comprovante via WhatsApp

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Gerar Prisma Client
npx prisma generate

# Rodar migrations
npx prisma migrate dev

# Desenvolvimento
npm run dev

# Build
npm run build