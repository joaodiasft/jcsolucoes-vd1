/**
 * Configuração do sistema — COMMITAR NO GITHUB
 *
 * Segredos sensíveis: copie config.local.example.js → config.local.js (gitignore)
 * Hash de token admin: node scripts/hash-token.js SEU_TOKEN
 */
window.JCPAG_CONFIG = {
  /** Chave de criptografia localStorage (mín. 32 caracteres) */
  STORAGE_SECRET: "jc-prod-storage-secret-32chars-min!!",

  /** Assinatura HMAC das sessões */
  SESSION_PEPPER: "jc-prod-session-pepper-2026!!",

  /** Pepper para hash dos tokens de login */
  TOKEN_PEPPER: "jc-prod-pepper-jcsolucoes-2026",

  /** Nome exibido do administrador (após login) */
  ADMIN_NOME: "João Claudio",

  /** Hash SHA-256 do token admin — gere com scripts/hash-token.js */
  ADMIN_TOKEN_HASH: "b92b94c0760e76250b8bce74b4118aff2e9d4fa1bfb65f6588789f88c8214670",

  /** Dados Pix exibidos ao cliente */
  PIX: {
    tipo: "E-mail",
    email: "jcsolucoesgo@gmail.com",
    banco: "Sicoob",
    nome: "João Claudio",
  },
};
