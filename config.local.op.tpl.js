/**
 * Template 1Password — NÃO commitar config.local.js gerado
 *
 * 1. Crie item "JCPagamentos" no 1Password (campos abaixo)
 * 2. Ajuste os caminhos op:// conforme seu vault
 * 3. Execute: op inject -i config.local.op.tpl.js -o config.local.js -f
 *
 * Campos sugeridos no 1Password:
 *   storage_secret, session_pepper, token_pepper, admin_token_hash
 *   pix_email, pix_banco, pix_nome
 */
Object.assign(window.JCPAG_CONFIG, {
  STORAGE_SECRET: "{{ op://Private/JCPagamentos/storage_secret }}",
  SESSION_PEPPER: "{{ op://Private/JCPagamentos/session_pepper }}",
  TOKEN_PEPPER: "{{ op://Private/JCPagamentos/token_pepper }}",
  ADMIN_TOKEN_HASH: "{{ op://Private/JCPagamentos/admin_token_hash }}",
  ADMIN_NOME: "{{ op://Private/JCPagamentos/admin_nome }}",
  PIX: {
    tipo: "E-mail",
    email: "{{ op://Private/JCPagamentos/pix_email }}",
    banco: "{{ op://Private/JCPagamentos/pix_banco }}",
    nome: "{{ op://Private/JCPagamentos/pix_nome }}",
  },
});
