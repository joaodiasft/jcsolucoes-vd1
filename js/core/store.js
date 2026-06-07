/**
 * ============================================================================
 * JCPag — Armazenamento criptografado
 * Único ponto de leitura/gravação de dados persistentes.
 * ============================================================================
 */
"use strict";

window.JCPagStore = (function () {
  const STORAGE_KEY = "jc-pag-encrypted-v2";
  const LEGACY_KEY = "jc-pagamentos-v1";

  function storeVazio() {
    return {
      v: 2,
      clientes: [],
      contratos: [],
      parcelas: [],
      logs: [],
      inicializado: false,
    };
  }

  function storageSecrets() {
    const cfg = window.JCPAG_CONFIG || {};
    const list = [cfg.STORAGE_SECRET, ...(cfg.LEGACY_STORAGE_SECRETS || [])];
    return [...new Set(list.filter((s) => typeof s === "string" && s.length >= 32))];
  }

  async function decryptWithSecret(raw, secret) {
    const cfg = window.JCPAG_CONFIG;
    const anterior = cfg.STORAGE_SECRET;
    cfg.STORAGE_SECRET = secret;
    try {
      return await JCPagCrypto.decrypt(raw);
    } finally {
      cfg.STORAGE_SECRET = anterior;
    }
  }

  async function carregar() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const secrets = storageSecrets();
      if (!secrets.length) {
        throw new Error("JCPAG_CONFIG.STORAGE_SECRET inválido (mínimo 32 caracteres).");
      }

      const chaveAtual = secrets[0];
      let ultimoErro = null;

      for (const secret of secrets) {
        try {
          const json = await decryptWithSecret(raw, secret);
          const data = JSON.parse(json);
          if (!data.v) throw new Error("Versão inválida");

          if (secret !== chaveAtual) {
            console.info("[JCPagStore] Dados abertos com chave legada — migrando para chave atual.");
            await salvar(data);
          }

          return data;
        } catch (e) {
          ultimoErro = e;
        }
      }

      console.error("[JCPagStore] Falha ao descriptografar:", ultimoErro?.message);
      throw new Error(
        "Não foi possível abrir os dados salvos. Seus dados NÃO foram apagados — verifique STORAGE_SECRET em config.example.js.",
      );
    }

    if (localStorage.getItem(LEGACY_KEY)) {
      localStorage.removeItem(LEGACY_KEY);
    }

    return storeVazio();
  }

  async function salvar(data) {
    data.v = 2;
    const json = JSON.stringify(data);
    const encrypted = await JCPagCrypto.encrypt(json);
    localStorage.setItem(STORAGE_KEY, encrypted);
    return data;
  }

  async function resetar() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_KEY);
    return storeVazio();
  }

  return Object.freeze({
    STORAGE_KEY,
    storeVazio,
    carregar,
    salvar,
    resetar,
  });
})();
