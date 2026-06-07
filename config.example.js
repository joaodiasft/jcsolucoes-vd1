/**
 * Configuração de exemplo — COMMITAR NO GITHUB
 *
 * ANTES DE PRODUÇÃO:
 *   1. Copie: cp config.local.example.js config.local.js
 *   2. Altere TODOS os valores marcados com ALTERAR em config.local.js
 *   3. Gere hashes:         node scripts/hash-token.js SEU_TOKEN
 *   4. Defina DEMO_MODE: false em config.local.js
 *
 * config.local.js está no .gitignore e NÃO deve ser enviado ao GitHub.
 */
window.JCPAG_CONFIG = {
  /** true = exibe tokens de demo e popula dados fictícios na 1ª execução */
  DEMO_MODE: true,

  /** ALTERAR — mínimo 32 caracteres. Usado para criptografar localStorage (AES-256-GCM) */
  STORAGE_SECRET: "jc-demo-storage-secret-32chars-min!!",

  /** ALTERAR — assinatura HMAC das sessões */
  SESSION_PEPPER: "jc-demo-session-pepper-2026!!",

  /** ALTERAR — hash SHA-256 dos tokens de login (token + pepper) */
  TOKEN_PEPPER: "jc-demo-pepper-change-in-production-2026",

  /** Nome exibido do administrador */
  ADMIN_NOME: "João Claudio",

  /**
   * Hash do token admin — token: jcsolucoes2026
   * Gere novo hash: node scripts/hash-token.js SEU_TOKEN
   */
  ADMIN_TOKEN_HASH: "41d5bb10837fe115d5b02095e3ed9740c7a16a265c6ee25356ca19f42bcb062d",

  /** Dados Pix — exibidos ao cliente ao pagar */
  PIX: {
    tipo: "E-mail",
    email: "jcsolucoesgo@gmail.com",
    banco: "Sicoob",
    nome: "João Claudio",
  },

  /**
   * Somente visível na UI quando DEMO_MODE === true
   * Em produção, remova ou deixe vazio e não exiba na tela de login
   */
  TOKENS_DEMO: {
    admin: { token: "jcsolucoes2026", label: "Administrador JC Soluções" },
    cliente: { token: "USER001", label: "João Silva (cliente demo)" },
  },
};
