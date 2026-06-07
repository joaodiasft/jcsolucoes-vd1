/**
 * ============================================================================
 * JCPag — Armazenamento criptografado (NÃO EDITAR)
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

  async function carregar() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const json = await JCPagCrypto.decrypt(raw);
        const data = JSON.parse(json);
        if (!data.v) throw new Error("Versão inválida");
        return data;
      } catch (e) {
        console.error("[JCPagStore] Falha ao descriptografar:", e.message);
        throw new Error(
          "Não foi possível ler os dados criptografados. Verifique STORAGE_SECRET em config.js",
        );
      }
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
