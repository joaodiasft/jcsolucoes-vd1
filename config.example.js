/**
 * Configuração do sistema — COMMITAR NO GITHUB
 *
 * Segredos sensíveis: copie config.local.example.js → config.local.js (gitignore)
 * Hash de token admin: node scripts/hash-token.js SEU_TOKEN
 */
window.JCPAG_CONFIG = {
  /** Chave de criptografia localStorage (mín. 32 caracteres) */
  STORAGE_SECRET: "jc-prod-storage-secret-32chars-min!!",

  /** Chaves antigas — usadas só para abrir dados já salvos e migrar (não apaga) */
  LEGACY_STORAGE_SECRETS: [
    "jc-demo-storage-secret-32chars-min!!",
  ],

  /** Pepper para hash dos tokens de login */
  TOKEN_PEPPER: "jc-prod-pepper-jcsolucoes-2026",

  /** Peppers antigos — tokens cadastrados antes da migração continuam válidos */
  LEGACY_TOKEN_PEPPERS: [
    "jc-demo-pepper-change-in-production-2026",
  ],

  /** Assinatura HMAC das sessões */
  SESSION_PEPPER: "jc-prod-session-pepper-2026!!",

  /** Peppers antigos de sessão — login ativo antes da migração continua válido */
  LEGACY_SESSION_PEPPERS: [
    "jc-demo-session-pepper-2026!!",
  ],

  /** Nome exibido do administrador (após login) */
  ADMIN_NOME: "João Claudio",

  /** Hash SHA-256 do token admin — gere com scripts/hash-token.js */
  ADMIN_TOKEN_HASH: "b92b94c0760e76250b8bce74b4118aff2e9d4fa1bfb65f6588789f88c8214670",

  /** Tempo máximo de inatividade no painel de gestão (minutos) */
  ADMIN_IDLE_MINUTES: 5,

  /** Dados Pix exibidos ao cliente */
  PIX: {
    tipo: "E-mail",
    email: "jcsolucoesgo@gmail.com",
    banco: "Sicoob",
    nome: "João Claudio",
  },

  /**
   * Clientes com token fixo — garantidos ativos a cada init (hash SHA-256 + TOKEN_PEPPER).
   * Tokens: MIRIAN2026, GABRIEL2026 (maiúsculas, sem espaços)
   */
  CLIENTES_PADRAO: [
    {
      seedKey: "mirian",
      nome: "Miriam",
      email: "",
      telefone: "",
      tokenHash: "7eba288eee134742c7a1be2ca3385f7590166e4dad42fd03a9df4ae9d6f9f5ca",
      tokenPreview: "MIRI***",
    },
    {
      seedKey: "gabriel",
      nome: "Gabriel",
      email: "",
      telefone: "",
      tokenHash: "8edf9c5a5cb5820a31b64ab10a9b80f52c15c819825cecb26cc0d9b6466b809a",
      tokenPreview: "GABR***",
    },
  ],
};
