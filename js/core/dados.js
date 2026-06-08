/**
 * JC Soluções — API de negócios
 * Todas as mutações passam por validação de sessão (servidor = guard + store).
 * NÃO persista dados sensíveis fora de JCPagStore.
 */
"use strict";

window.JCPag = (function () {
  let store = null;
  let ready = false;
  let initPromise = null;

  const hoje = () => new Date().toISOString().slice(0, 10);
  const uid = () => Date.now() + "-" + Math.random().toString(36).slice(2, 9);

  function cfg() {
    return window.JCPAG_CONFIG;
  }

  function formatarMoeda(v) {
    return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatarData(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  function formatarDataHora(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function persistir(syncAtrasos = true) {
    if (syncAtrasos) sincronizarAtrasos();
    store = await JCPagStore.salvar(store);
    return store;
  }

  function sincronizarAtrasos() {
    const agora = hoje();
    store.parcelas.forEach((p) => {
      if (p.status === "pendente" && p.vencimento < agora) p.status = "atrasado";
    });
  }

  async function garantirClientesPadrao() {
    const lista = cfg().CLIENTES_PADRAO;
    if (!Array.isArray(lista) || !lista.length) return 0;

    let atualizados = 0;

    for (const seed of lista) {
      if (!seed?.nome) continue;

      const tokenPlain = seed.token ? JCPagAuth.normalizarToken(seed.token) : null;
      const tokenHash = tokenPlain ? await JCPagAuth.hashToken(tokenPlain) : seed.tokenHash;
      const tokenPreview = tokenPlain ? JCPagAuth.tokenPreview(tokenPlain) : seed.tokenPreview;
      if (!tokenHash || !tokenPreview) continue;

      let cliente =
        store.clientes.find((c) => c.seedKey === seed.seedKey) ||
        store.clientes.find((c) => c.tokenHash === tokenHash) ||
        store.clientes.find((c) => c.tokenPreview === tokenPreview) ||
        store.clientes.find(
          (c) => String(c.nome || "").trim().toLowerCase() === String(seed.nome).trim().toLowerCase(),
        );

      if (cliente) {
        const precisaAtualizar =
          cliente.ativo === false ||
          cliente.tokenHash !== tokenHash ||
          cliente.tokenPreview !== tokenPreview ||
          cliente.seedKey !== seed.seedKey;

        if (precisaAtualizar) {
          cliente.tokenHash = tokenHash;
          cliente.tokenPreview = tokenPreview;
          cliente.seedKey = seed.seedKey;
          cliente.ativo = true;
          if (seed.email != null && !cliente.email) cliente.email = seed.email;
          if (seed.telefone != null && !cliente.telefone) cliente.telefone = seed.telefone;
          atualizados++;
        }
      } else {
        store.clientes.push({
          id: uid(),
          seedKey: seed.seedKey,
          nome: String(seed.nome).trim(),
          email: String(seed.email || "").trim(),
          telefone: String(seed.telefone || "").trim(),
          tokenHash,
          tokenPreview,
          ativo: true,
          criadoEm: hoje(),
        });
        atualizados++;
      }
    }

    return atualizados;
  }

  function contarVinculosCliente(clienteId) {
    const contratos = store.contratos.filter((c) => c.clienteId === clienteId).length;
    const parcelas = store.parcelas.filter((p) => p.clienteId === clienteId).length;
    return contratos + parcelas;
  }

  function reassignClienteId(deId, paraId) {
    store.contratos.forEach((c) => {
      if (c.clienteId === deId) c.clienteId = paraId;
    });
    store.parcelas.forEach((p) => {
      if (p.clienteId === deId) p.clienteId = paraId;
    });
  }

  function normalizarClientesExistentes() {
    let ajustes = 0;
    const seedKeys = new Set((cfg().CLIENTES_PADRAO || []).map((s) => s.seedKey).filter(Boolean));

    store.clientes.forEach((c) => {
      if (c.ativo === undefined) {
        c.ativo = true;
        ajustes++;
      }
    });

    const porHash = new Map();
    const idsRemover = new Set();

    store.clientes.forEach((c) => {
      if (!c.tokenHash || idsRemover.has(c.id)) return;

      const existente = porHash.get(c.tokenHash);
      if (!existente) {
        porHash.set(c.tokenHash, c);
        return;
      }

      const manter =
        contarVinculosCliente(c.id) > contarVinculosCliente(existente.id)
          ? c
          : existente;
      const remover = manter.id === c.id ? existente : c;

      reassignClienteId(remover.id, manter.id);
      porHash.set(c.tokenHash, manter);
      idsRemover.add(remover.id);
      ajustes++;
    });

    if (idsRemover.size) {
      store.clientes = store.clientes.filter((c) => !idsRemover.has(c.id));
    }

    store.clientes.forEach((c) => {
      if (seedKeys.has(c.seedKey) && c.ativo === false) {
        c.ativo = true;
        ajustes++;
      }
    });

    return ajustes;
  }

  function consolidarClientesDuplicados() {
    let ajustes = 0;
    const porPreview = new Map();

    store.clientes.forEach((c) => {
      if (!c.tokenPreview) return;
      if (!porPreview.has(c.tokenPreview)) porPreview.set(c.tokenPreview, []);
      porPreview.get(c.tokenPreview).push(c);
    });

    porPreview.forEach((lista) => {
      if (lista.length < 2) return;

      const manter = lista.reduce((melhor, atual) => {
        const vMelhor = contarVinculosCliente(melhor.id);
        const vAtual = contarVinculosCliente(atual.id);
        if (vAtual > vMelhor) return atual;
        if (vAtual < vMelhor) return melhor;
        if (atual.seedKey && !melhor.seedKey) return atual;
        return melhor;
      });

      lista.forEach((c) => {
        if (c.id === manter.id) return;
        reassignClienteId(c.id, manter.id);
        store.clientes = store.clientes.filter((x) => x.id !== c.id);
        ajustes++;
      });

      if (manter.seedKey) {
        const seed = (cfg().CLIENTES_PADRAO || []).find((s) => s.seedKey === manter.seedKey);
        if (seed && !manter.nome.includes(" ")) {
          const rico = lista.find((c) => String(c.nome || "").includes(" "));
          if (rico) {
            manter.nome = rico.nome;
            if (!manter.email) manter.email = rico.email;
            if (!manter.telefone) manter.telefone = rico.telefone;
          }
        }
      }
    });

    return ajustes;
  }

  async function sincronizarBancoLogins(registrar = false) {
    const consolidados = consolidarClientesDuplicados();
    const padrao = await garantirClientesPadrao();
    const normalizados = normalizarClientesExistentes();
    const changed = padrao > 0 || normalizados > 0 || consolidados > 0;

    if (changed) {
      await persistir(false);
    }

    const stats = {
      changed,
      padrao,
      normalizados,
      totalClientes: store.clientes.length,
      ativos: store.clientes.filter((c) => c.ativo !== false && c.tokenHash).length,
    };

    if (registrar && changed) {
      await registrarLog(
        "Banco de logins sincronizado",
        `${stats.ativos} cliente(s) ativo(s) · ${stats.padrao} padrão · ${stats.normalizados} ajuste(s)`,
        getAutorAdmin(),
      );
    }

    return stats;
  }

  async function init() {
    if (ready) return store;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        if (!window.JCPAG_CONFIG) {
          throw new Error("JCPAG_CONFIG não carregado. Inclua config.example.js antes dos scripts.");
        }
        store = await JCPagStore.carregar();
        if (!store.clientes) store.clientes = [];
        if (!store.contratos) store.contratos = [];
        if (!store.parcelas) store.parcelas = [];
        if (!store.logs) store.logs = [];
        await sincronizarBancoLogins(false);
        if (!store.inicializado) {
          store.inicializado = true;
          await persistir(false);
        }
        sincronizarAtrasos();
        ready = true;
        return store;
      } catch (e) {
        initPromise = null;
        ready = false;
        store = null;
        throw e;
      }
    })();

    return initPromise;
  }

  function getDados() {
    return store;
  }

  function calcularKPIs(parcelas) {
    const agora = hoje();
    let faturamento = 0;
    let recebido = 0;
    let pendente = 0;
    let atrasado = 0;
    parcelas.forEach((p) => {
      faturamento += p.valor;
      if (p.status === "pago") recebido += p.valor;
      else {
        pendente += p.valor;
        if (p.vencimento < agora) atrasado += p.valor;
      }
    });
    return { faturamento, recebido, pendente, atrasado };
  }

  function getCliente(id) {
    return store.clientes.find((c) => c.id === id);
  }

  function getContrato(id) {
    return store.contratos.find((c) => c.id === id);
  }

  function parcelasDoCliente(clienteId) {
    return store.parcelas.filter((p) => p.clienteId === clienteId);
  }

  function contratosDoCliente(clienteId) {
    return store.contratos.filter((c) => c.clienteId === clienteId);
  }

  async function registrarLog(acao, detalhes, autor) {
    store.logs.unshift({
      id: uid(),
      data: new Date().toISOString(),
      autor: autor?.nome || "Sistema",
      tipoAutor: autor?.tipo || "sistema",
      acao,
      detalhes: detalhes || "",
    });
    if (store.logs.length > 200) store.logs.length = 200;
    await persistir(false);
  }

  function getAutorAdmin() {
    return { nome: cfg().ADMIN_NOME, tipo: "admin" };
  }

  async function getAutorCliente() {
    const sessao = await JCPagAuth.validarSessao();
    if (!sessao?.clienteId) return { nome: "Cliente", tipo: "cliente" };
    const c = getCliente(sessao.clienteId);
    return c ? { nome: c.nome, tipo: "cliente" } : { nome: "Cliente", tipo: "cliente" };
  }

  async function exigirSessaoAdmin() {
    const sessao = await JCPagGuard.exigirAdmin();
    if (!sessao) throw new Error("Sessão admin inválida");
    return sessao;
  }

  function statusLabel(status) {
    if (status === "pago") return { texto: "Pago", cls: "jcpag-badge jcpag-badge--ok" };
    if (status === "atrasado") return { texto: "Atrasado", cls: "jcpag-badge jcpag-badge--danger" };
    return { texto: "Pendente", cls: "jcpag-badge jcpag-badge--warn" };
  }

  async function gerarTokenCliente() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let tent = 0; tent < 50; tent++) {
      let token = "USER";
      for (let i = 0; i < 3; i++) token += chars[Math.floor(Math.random() * chars.length)];
      const hash = await JCPagAuth.hashToken(token);
      if (!store.clientes.some((c) => c.tokenHash === hash)) return { token, hash };
    }
    throw new Error("Não foi possível gerar token único.");
  }

  function listaPeppers(atual, legado) {
    return [...new Set([atual, ...(legado || [])].filter((p) => typeof p === "string" && p.length >= 16))];
  }

  async function validarSessaoAtiva() {
    const chaveAtual = cfg().SESSION_PEPPER;
    const peppers = listaPeppers(chaveAtual, cfg().LEGACY_SESSION_PEPPERS);

    for (const pepper of peppers) {
      cfg().SESSION_PEPPER = pepper;
      try {
        const sessao = await JCPagAuth.validarSessao();
        if (!sessao) continue;

        cfg().SESSION_PEPPER = chaveAtual;
        if (pepper !== chaveAtual) {
          const { v, role, sid, exp, sig, ...dados } = sessao;
          await JCPagAuth.criarSessao(role, dados);
          return JCPagAuth.validarSessao();
        }
        return sessao;
      } catch {
        // tenta próximo pepper
      }
    }

    cfg().SESSION_PEPPER = chaveAtual;
    return null;
  }

  async function encontrarClientePorToken(token) {
    const t = JCPagAuth.normalizarToken(token);
    if (!t) return null;

    const peppers = listaPeppers(cfg().TOKEN_PEPPER, cfg().LEGACY_TOKEN_PEPPERS);
    for (const pepper of peppers) {
      const anterior = cfg().TOKEN_PEPPER;
      cfg().TOKEN_PEPPER = pepper;
      try {
        const hash = await JCPagAuth.hashToken(t);
        const cliente = store.clientes.find((c) => c.ativo !== false && c.tokenHash === hash);
        if (cliente) return cliente;
      } finally {
        cfg().TOKEN_PEPPER = anterior;
      }
    }
    return null;
  }

  function resolverClienteDaSessao(sessao) {
    const c = getCliente(sessao.clienteId);
    if (c && c.ativo !== false) {
      return { ...c, nome: c.nome || sessao.nome || "Cliente" };
    }
    if (sessao.clienteId) {
      return {
        id: sessao.clienteId,
        nome: sessao.nome || "Cliente",
        email: c?.email || "",
        ativo: true,
        _sessaoOrfa: !c,
      };
    }
    return null;
  }

  async function obterContextoCliente() {
    const sessao = await validarSessaoAtiva();
    if (!sessao || sessao.role !== "cliente" || !sessao.clienteId) return null;
    await init();
    const cliente = resolverClienteDaSessao(sessao);
    if (!cliente) return null;
    return { sessao, cliente };
  }

  // ===== AUTH =====
  async function login(token) {
    await init();
    const bloqueio = JCPagAuth.verificarBloqueioLogin();
    if (bloqueio.bloqueado) {
      return { ok: false, erro: `Muitas tentativas. Aguarde ${bloqueio.minutos} min.` };
    }

    const t = JCPagAuth.normalizarToken(token);
    if (!t) return { ok: false, erro: "Token inválido." };

    if (await JCPagAuth.validarTokenAdmin(t)) {
      await JCPagAuth.criarSessao("admin", { nome: cfg().ADMIN_NOME });
      JCPagAuth.limparFalhasLogin();
      await registrarLog("Login realizado", "Painel administrativo", getAutorAdmin());
      return { ok: true, tipo: "admin", redirect: JCPagGuard.ROUTES.admin };
    }

    const cliente = await encontrarClientePorToken(t);
    if (cliente) {
      await JCPagAuth.criarSessao("cliente", { clienteId: cliente.id, nome: cliente.nome });
      JCPagAuth.limparFalhasLogin();
      await registrarLog("Login realizado", "Portal do cliente", { nome: cliente.nome, tipo: "cliente" });
      return { ok: true, tipo: "cliente", redirect: JCPagGuard.ROUTES.cliente };
    }

    JCPagAuth.registrarFalhaLogin();
    return { ok: false, erro: "Token inválido ou expirado." };
  }

  async function logout(detalhes) {
    const sessao = await validarSessaoAtiva();
    const msg = detalhes || "Painel administrativo";
    if (sessao?.role === "admin" && ready && store) {
      await registrarLog("Logout", msg, getAutorAdmin());
    } else if (sessao?.role === "cliente" && ready && store) {
      const c = getCliente(sessao.clienteId);
      const autor = c
        ? { nome: c.nome, tipo: "cliente" }
        : { nome: sessao.nome || "Cliente", tipo: "cliente" };
      await registrarLog("Logout", detalhes || "Portal do cliente", autor);
    }
    JCPagAuth.destruirSessao();
    window.location.href = JCPagGuard.ROUTES.login;
  }

  async function getClienteLogado() {
    const ctx = await obterContextoCliente();
    return ctx?.cliente || null;
  }

  // ===== ADMIN (exige sessão admin validada) =====
  async function adicionarCliente(payload) {
    await exigirSessaoAdmin();
    let tokenPlain = payload.token ? JCPagAuth.normalizarToken(payload.token) : null;
    let tokenHash;
    if (tokenPlain) {
      tokenHash = await JCPagAuth.hashToken(tokenPlain);
    } else {
      const gerado = await gerarTokenCliente();
      tokenPlain = gerado.token;
      tokenHash = gerado.hash;
    }

    const cliente = {
      id: uid(),
      nome: String(payload.nome || "").trim(),
      email: String(payload.email || "").trim(),
      telefone: String(payload.telefone || "").trim(),
      tokenHash,
      tokenPreview: JCPagAuth.tokenPreview(tokenPlain),
      ativo: true,
      criadoEm: hoje(),
    };
    store.clientes.push(cliente);
    await registrarLog(
      "Cliente cadastrado",
      `${cliente.nome} · ${cliente.tokenPreview}`,
      getAutorAdmin(),
    );
    await persistir();
    return { cliente, tokenPlain };
  }

  async function atualizarCliente(id, patch) {
    await exigirSessaoAdmin();
    const idx = store.clientes.findIndex((c) => c.id === id);
    if (idx < 0) return null;

    const atual = store.clientes[idx];
    let tokenPlain = null;
    if (patch.token) {
      tokenPlain = JCPagAuth.normalizarToken(patch.token);
      atual.tokenHash = await JCPagAuth.hashToken(tokenPlain);
      atual.tokenPreview = JCPagAuth.tokenPreview(tokenPlain);
    }

    store.clientes[idx] = {
      ...atual,
      nome: patch.nome != null ? String(patch.nome).trim() : atual.nome,
      email: patch.email != null ? String(patch.email).trim() : atual.email,
      telefone: patch.telefone != null ? String(patch.telefone).trim() : atual.telefone,
      atualizadoEm: hoje(),
    };

    await registrarLog(
      "Cliente editado",
      `${store.clientes[idx].nome} · ${store.clientes[idx].tokenPreview}`,
      getAutorAdmin(),
    );
    await persistir();
    return { cliente: store.clientes[idx], tokenPlain };
  }

  async function criarContrato(payload) {
    await exigirSessaoAdmin();
    const valorParcela = Math.round((payload.valorTotal / payload.parcelas) * 100) / 100;
    const contrato = {
      id: uid(),
      clienteId: payload.clienteId,
      servico: String(payload.servico || "").trim(),
      dataInicio: payload.dataInicio || hoje(),
      status: "ativo",
      valorTotal: payload.valorTotal,
      parcelas: payload.parcelas,
      criadoEm: hoje(),
    };
    store.contratos.push(contrato);

    const base = new Date((payload.primeiroVencimento || hoje()) + "T12:00:00");
    for (let i = 0; i < payload.parcelas; i++) {
      const venc = new Date(base);
      venc.setMonth(venc.getMonth() + i);
      store.parcelas.push({
        id: uid(),
        contratoId: contrato.id,
        clienteId: payload.clienteId,
        numero: i + 1,
        vencimento: venc.toISOString().slice(0, 10),
        valor: valorParcela,
        status: "pendente",
        pagoEm: null,
      });
    }

    const cliente = getCliente(payload.clienteId);
    await registrarLog(
      "Contrato criado",
      `${cliente?.nome || "Cliente"} · ${contrato.servico} · ${payload.parcelas}x ${formatarMoeda(valorParcela)}`,
      getAutorAdmin(),
    );
    await persistir();
    return contrato;
  }

  async function marcarParcelaPaga(parcelaId) {
    await exigirSessaoAdmin();
    const p = store.parcelas.find((x) => x.id === parcelaId);
    if (!p) return false;
    const cliente = getCliente(p.clienteId);
    p.status = "pago";
    p.pagoEm = hoje();
    await registrarLog(
      "Parcela marcada como paga",
      `${cliente?.nome || "Cliente"} · ${p.numero}ª · ${formatarMoeda(p.valor)}`,
      getAutorAdmin(),
    );
    await persistir();
    return true;
  }

  async function registrarPagamentoPix(parcelaId) {
    await init();
    const ctx = await obterContextoCliente();
    if (!ctx) throw new Error("Sessão cliente inválida");

    const { sessao, cliente } = ctx;
    const p = store.parcelas.find((x) => x.id === parcelaId);
    if (!p || p.clienteId !== sessao.clienteId) {
      throw new Error("Parcela não pertence a este cliente.");
    }
    if (p.status === "pago") throw new Error("Parcela já está paga.");

    await registrarLog(
      "Pagamento Pix solicitado",
      `${cliente.nome} · ${p.numero}ª · ${formatarMoeda(p.valor)} · venc. ${formatarData(p.vencimento)}`,
      { nome: cliente.nome, tipo: "cliente" },
    );
    return p;
  }

  async function resetarSistema() {
    await exigirSessaoAdmin();
    store = await JCPagStore.resetar();
    store.inicializado = true;
    await sincronizarBancoLogins(false);
    await registrarLog("Sistema resetado", "Base zerada pelo administrador", getAutorAdmin());
    return store;
  }

  async function sincronizarBanco() {
    ready = false;
    initPromise = null;
    store = null;
    await init();

    const stats = await sincronizarBancoLogins(true);

    if (JCPagStore.usaSupabase() && store) {
      try {
        store = await JCPagStore.forcarSyncNuvem(store);
        delete store._modoOffline;
        delete store._avisoNuvem;
      } catch (e) {
        stats.erroNuvem = e.message;
      }
    }
    return stats;
  }

  return Object.freeze({
    init,
    get ready() { return ready; },
    get dados() { return store; },
    hoje,
    formatarMoeda,
    formatarData,
    formatarDataHora,
    calcularKPIs,
    getCliente,
    getContrato,
    parcelasDoCliente,
    contratosDoCliente,
    statusLabel,
    getAutorAdmin,
    getAutorCliente,
    login,
    logout,
    getClienteLogado,
    obterContextoCliente,
    validarSessaoAtiva,
    adicionarCliente,
    atualizarCliente,
    criarContrato,
    marcarParcelaPaga,
    registrarPagamentoPix,
    resetarSistema,
    sincronizarBanco,
    guard: JCPagGuard,
    cfg,
  });
})();
