/**
 * ============================================================================
 * JCPag — Armazenamento (Supabase produção + cache local offline)
 * ============================================================================
 */
"use strict";

window.JCPagStore = (function () {
  const STORAGE_KEY = "jc-pag-encrypted-v2";
  const LEGACY_KEY = "jc-pagamentos-v1";
  const RETRY_STATUS = new Set([502, 503, 504]);
  const MAX_TENTATIVAS = 6;

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

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

  function erroRetryavel(status, body) {
    if (RETRY_STATUS.has(status)) return true;
    const txt = String(body || "");
    return txt.includes("PGRST002") || txt.includes("schema cache");
  }

  async function fetchSupabase(url, options = {}) {
    let ultimoErro = "";

    for (let tent = 0; tent < MAX_TENTATIVAS; tent++) {
      const res = await fetch(url, options);
      if (res.ok) return res;

      const body = await res.text();
      ultimoErro = body;

      if (!erroRetryavel(res.status, body) || tent === MAX_TENTATIVAS - 1) {
        throw new Error(
          `Banco na nuvem indisponível (${res.status}). O projeto Supabase pode estar acordando — aguarde 1 minuto e clique em Atualizar banco.`,
        );
      }

      console.warn(`[JCPagStore] Tentativa ${tent + 1}/${MAX_TENTATIVAS} falhou (${res.status}). Reagendando…`);
      await sleep(2000 * (tent + 1));
    }

    throw new Error(ultimoErro || "Falha ao conectar ao banco remoto.");
  }

  function normalizarStore(data) {
    if (!data.clientes) data.clientes = [];
    if (!data.contratos) data.contratos = [];
    if (!data.parcelas) data.parcelas = [];
    if (!data.logs) data.logs = [];
    return data;
  }

  async function carregarSupabase() {
    const base = cfg().SUPABASE_URL.replace(/\/$/, "");
    const res = await fetchSupabase(`${base}/rest/v1/jcpag_snapshot?id=eq.1&select=data`, {
      headers: headersSupabase(),
    });

    const rows = await res.json();
    if (!rows.length || !rows[0].data) return storeVazio();

    const data = normalizarStore(rows[0].data);
    if (!data.v) throw new Error("Versão inválida no banco remoto.");
    return data;
  }

  async function salvarSupabase(data) {
    const base = cfg().SUPABASE_URL.replace(/\/$/, "");
    const payload = normalizarStore({ ...data });
    delete payload._modoOffline;
    delete payload._avisoNuvem;
    payload.v = 2;

    await fetchSupabase(`${base}/rest/v1/jcpag_snapshot?id=eq.1`, {
      method: "PATCH",
      headers: headersSupabase({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        data: payload,
        updated_at: new Date().toISOString(),
      }),
    });

    return payload;
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
          const data = normalizarStore(JSON.parse(json));
          if (!data.v) throw new Error("Versão inválida");

          if (secret !== chaveAtual && !usaSupabase()) {
            console.info("[JCPagStore] Dados abertos com chave legada — migrando para chave atual.");
            await salvarLocal(data);
          }

          return data;
        } catch (e) {
          ultimoErro = e;
        }
      }

      console.error("[JCPagStore] Falha ao descriptografar cache local:", ultimoErro?.message);
    }

    if (localStorage.getItem(LEGACY_KEY)) {
      localStorage.removeItem(LEGACY_KEY);
    }

    return storeVazio();
  }

  async function salvarLocal(data) {
    const payload = normalizarStore({ ...data });
    delete payload._modoOffline;
    delete payload._avisoNuvem;
    payload.v = 2;
    const json = JSON.stringify(payload);
    const encrypted = await JCPagCrypto.encrypt(json);
    localStorage.setItem(STORAGE_KEY, encrypted);
    return payload;
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
        const local = normalizarStore(JSON.parse(json));
        if (!local?.v) continue;

        if (contarItens(local) > contarItens(remoto)) {
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
    if (!usaSupabase()) {
      return carregarLocal();
    }

    try {
      let remoto = await carregarSupabase();
      remoto = await migrarLocalParaNuvem(remoto);
      await salvarLocal(remoto);
      return remoto;
    } catch (e) {
      console.warn("[JCPagStore]", e.message);

      const local = await carregarLocal();
      if (contarItens(local) > 0) {
        local._modoOffline = true;
        local._avisoNuvem =
          "Nuvem temporariamente indisponível. Usando cópia local — clique em Atualizar banco quando possível.";
        return local;
      }

      const vazio = storeVazio();
      vazio._modoOffline = true;
      vazio._avisoNuvem =
        "Nuvem acordando. Logins padrão serão aplicados — sincronize com Atualizar banco em 1 minuto.";
      return vazio;
    }
  }

  async function salvar(data) {
    const payload = normalizarStore({ ...data });

    if (usaSupabase()) {
      await salvarLocal(payload);

      try {
        const salvo = await salvarSupabase(payload);
        delete salvo._modoOffline;
        delete salvo._avisoNuvem;
        return salvo;
      } catch (e) {
        console.warn("[JCPagStore] Salvo localmente; nuvem falhou:", e.message);
        payload._modoOffline = true;
        payload._avisoNuvem = "Alterações guardadas localmente. Clique em Atualizar banco para enviar à nuvem.";
        return payload;
      }
    }

    return salvarLocal(payload);
  }

  async function resetar() {
    if (usaSupabase()) {
      localStorage.removeItem(STORAGE_KEY);
      return resetarSupabase();
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_KEY);
    return storeVazio();
  }

  async function forcarSyncNuvem(data) {
    if (!usaSupabase()) return data;
    const salvo = await salvarSupabase(data);
    await salvarLocal(salvo);
    delete salvo._modoOffline;
    delete salvo._avisoNuvem;
    return salvo;
  }

  return Object.freeze({
    STORAGE_KEY,
    storeVazio,
    usaSupabase,
    carregar,
    salvar,
    resetar,
    forcarSyncNuvem,
  });
})();
