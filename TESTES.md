# 🧪 Sistema de Testes - JC Soluções

## ✅ Testes Implementados

### 1. Testes E2E com Playwright
- **Localização**: \	ests/dividas.spec.ts\
- **Configuração**: \playwright.config.ts\

### 2. Comandos de Teste

\\\ash
# Rodar todos os testes
npx playwright test

# Rodar com UI
npx playwright test --ui

# Rodar em modo headed (visível)
npx playwright test --headed

# Rodar apenas Chromium
npx playwright test --project=chromium

# Rodar teste específico
npx playwright test --grep \"login\"
\\\

### 3. Testes Incluídos

#### ✅ deve carregar a página inicial
- Verifica se a página inicial carrega
- Valida título da página

#### ✅ deve fazer login com sucesso
- Preenche email e senha
- Clica em entrar
- Valida redirecionamento para dashboard

#### ✅ deve exibir cards de estatísticas
- Verifica cards: Total Geral, Total Pago, Total a Receber, Devedores
- Valida presença de todos os elementos

#### ✅ deve cadastrar nova dívida
- Acessa formulário de cadastro
- Preenche dados do devedor
- Salva e valida retorno

#### ✅ deve visualizar detalhes da dívida
- Clica em ver detalhes
- Valida carregamento da página

#### ✅ deve editar dívida
- Acessa edição
- Valida formulário de edição

#### ✅ deve fazer logout
- Clica em sair
- Valida redirecionamento para login

## 📊 Status dos Testes

| Teste | Status |
|-------|--------|
| Carregar Página Inicial | ✅ Implementado |
| Login | ✅ Implementado |
| Dashboard Stats | ✅ Implementado |
| Cadastrar Dívida | ✅ Implementado |
| Visualizar Detalhes | ✅ Implementado |
| Editar Dívida | ✅ Implementado |
| Logout | ✅ Implementado |

## 🚀 Como Rodar

1. **Inicie o servidor de desenvolvimento:**
   \\\ash
   npm run dev
   \\\

2. **Execute os testes:**
   \\\ash
   npx playwright test
   \\\

3. **Veja o relatório HTML:**
   \\\ash
   npx playwright show-report
   \\\

## 📝 Observações

- Os testes rodam em navegador headless por padrão
- Timeout padrão: 30 segundos por teste
- Retry: 2 vezes em CI, 0 em desenvolvimento
- Navegador: Chromium

## 🔧 Configuração

O arquivo \playwright.config.ts\ define:
- Diretório de testes: \./tests\
- Navegadores: Chromium
- Timeout: 30s
- Retries: 0 (dev), 2 (CI)
