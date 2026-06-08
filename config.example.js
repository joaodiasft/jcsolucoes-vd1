/**
 * Configuração do sistema — COMMITAR NO GITHUB
 *
 * Segredos sensíveis: copie config.local.example.js → config.local.js (gitignore)
 * Hash de token admin: node scripts/hash-token.js SEU_TOKEN
 */
window.JCPAG_CONFIG = {
  /** local = navegador apenas | supabase = banco na nuvem (mesmos dados em qualquer aparelho) */
  STORAGE_BACKEND: "supabase",

  /** Supabase — projeto Jcsolucoes (sa-east-1) */
  SUPABASE_URL: "https://wthdtoucdvlmsyvtbxul.supabase.co",
  SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aGR0b3VjZHZsbXN5dnRieHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NjI1NTgsImV4cCI6MjA5MzMzODU1OH0.MJA1dlJoxZ-YUkAFtesHFIwXH9Hl9DxkzxNjs15mKG0",

  /** Chave de criptografia localStorage (fallback local / migração) */
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
   * Clientes com token fixo — sincronizados no banco a cada init / botão Atualizar banco.
   * Admin: jcsolucoes2026 (hash em ADMIN_TOKEN_HASH)
   */
  CLIENTES_PADRAO: [
    {
      seedKey: "mirian",
      nome: "Miriam",
      token: "MIRIAN2026",
      email: "",
      telefone: "",
    },
    {
      seedKey: "gabriel",
      nome: "Gabriel",
      token: "GABRIEL2026",
      email: "",
      telefone: "",
    },
  ],
};
