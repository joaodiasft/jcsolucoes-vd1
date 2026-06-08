/**
 * ============================================================================
 * JCPag — Armazenamento (local legado ou Supabase produção)
 * ============================================================================
 */
"use strict";

window.JCPagStore = (function () {
  const STORAGE_KEY = "jc-pag-encrypted-v2";
  const LEGACY_KEY = "jc-pagamentos-v1";

  function cfg() {
    return window.JCPAG_CONFIG || {};
  }

  function usaSupabase() {
    const c = cfg();
    return c.STORAGE_BACKEND === "supabase" && c.SUPABASE_URL && c.SUPABASE_ANON_KEY;
  }

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

  function headersSupabase(extra = {}) {
    const key = cfg().SUPABASE_ANON_KEY;
    return {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...extra,
    };
  }

  async function carregarSupabase() {
    const base = cfg().SUPABASE_URL.replace(/\/$/, "");
    const res = await fetch(`${base}/rest/v1/jcpag_snapshot?id=eq.1&select=data`, {
      headers: headersSupabase(),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Não foi possível carregar o banco remoto (${res.status}). ${msg}`);
    }

    const rows = await res.json();
    if (!rows.length || !rows[0].data) return storeVazio();

    const data = rows[0].data;
    if (!data.v) throw new Error("Versão inválida no banco remoto.");
    if (!data.clientes) data.clientes = [];
    if (!data.contratos) data.contratos = [];
    if (!data.parcelas) data.parcelas = [];
    if (!data.logs) data.logs = [];
    return data;
  }

  async function salvarSupabase(data) {
    const base = cfg().SUPABASE_URL.replace(/\/$/, "");
    data.v = 2;
    const res = await fetch(`${base}/rest/v1/jcpag_snapshot?id=eq.1`, {
      method: "PATCH",
      headers: headersSupabase({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        data,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Não foi possível salvar no banco remoto (${res.status}). ${msg}`);
    }

    return data;
  }

  async function resetarSupabase() {
    const vazio = storeVazio();
    await salvarSupabase(vazio);
    return vazio;
  }

  function storageSecrets() {
    const c = cfg();
    const list = [c.STORAGE_SECRET, ...(c.LEGACY_STORAGE_SECRETS || [])];
    return [...new Set(list.filter((s) => typeof s === "string" && s.length >= 32))];
  }

  async function decryptWithSecret(raw, secret) {
    const c = cfg();
    const anterior = c.STORAGE_SECRET;
    c.STORAGE_SECRET = secret;
    try {
      return await JCPagCrypto.decrypt(raw);
    } finally {
      c.STORAGE_SECRET = anterior;
    }
  }

  async function carregarLocal() {
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
            await salvarLocal(data);
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

  async function salvarLocal(data) {
    data.v = 2;
    const json = JSON.stringify(data);
    const encrypted = await JCPagCrypto.encrypt(json);
    localStorage.setItem(STORAGE_KEY, encrypted);
    return data;
  }

  function contarItens(data) {
    return (
      (data.clientes?.length || 0) +
      (data.contratos?.length || 0) +
      (data.parcelas?.length || 0) +
      (data.logs?.length || 0)
    );
  }

  async function migrarLocalParaNuvem(remoto) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return remoto;

    const secrets = storageSecrets();
    for (const secret of secrets) {
      try {
        const json = await decryptWithSecret(raw, secret);
        const local = JSON.parse(json);
        if (!local?.v) continue;

        const remotoQtd = contarItens(remoto);
        const localQtd = contarItens(local);

        if (localQtd > remotoQtd) {
          console.info("[JCPagStore] Migrando dados locais para o banco remoto.");
          await salvarSupabase(local);
          return local;
        }
      } catch {
        /* tenta próxima chave */
      }
    }

    return remoto;
  }

  async function carregar() {
    if (usaSupabase()) {
      let remoto = await carregarSupabase();
      remoto = await migrarLocalParaNuvem(remoto);
      return remoto;
    }
    return carregarLocal();
  }

  async function salvar(data) {
    if (usaSupabase()) {
      return salvarSupabase(data);
    }
    return salvarLocal(data);
  }

  async function resetar() {
    if (usaSupabase()) {
      return resetarSupabase();
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_KEY);
    return storeVazio();
  }

  return Object.freeze({
    STORAGE_KEY,
    storeVazio,
    usaSupabase,
    carregar,
    salvar,
    resetar,
  });
})();
