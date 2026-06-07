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

  async function seedDemo() {
    const tokenCliente1 = cfg().TOKENS_DEMO?.cliente?.token || "USER001";
    const hash1 = await JCPagAuth.hashToken(tokenCliente1);
    const hash2 = await JCPagAuth.hashToken("USER002");

    const c1 = {
      id: uid(),
      nome: "João Silva",
      email: "joao.silva@email.com",
      telefone: "(11) 98765-4321",
      tokenHash: hash1,
      tokenPreview: JCPagAuth.tokenPreview(tokenCliente1),
      ativo: true,
      criadoEm: hoje(),
    };
    const c2 = {
      id: uid(),
      nome: "Maria Santos",
      email: "maria.santos@email.com",
      telefone: "(11) 91234-5678",
      tokenHash: hash2,
      tokenPreview: JCPagAuth.tokenPreview("USER002"),
      ativo: true,
      criadoEm: hoje(),
    };

    const contrato1 = {
      id: uid(),
      clienteId: c1.id,
      servico: "Consultoria Dev Senior",
      dataInicio: "2026-01-01",
      status: "ativo",
      valorTotal: 9000,
      parcelas: 6,
      criadoEm: hoje(),
    };

    const parcelas = [];
    const base = new Date("2026-02-15T12:00:00");
    for (let i = 0; i < 6; i++) {
      const venc = new Date(base);
      venc.setMonth(venc.getMonth() + i);
      const vencimento = venc.toISOString().slice(0, 10);
      let status = "pendente";
      if (i < 2) status = "pago";
      parcelas.push({
        id: uid(),
        contratoId: contrato1.id,
        clienteId: c1.id,
        numero: i + 1,
        vencimento,
        valor: 1500,
        status,
        pagoEm: status === "pago" ? vencimento : null,
      });
    }

    store.clientes = [c1, c2];
    store.contratos = [contrato1];
    store.parcelas = parcelas;
    store.logs = [];
    store.inicializado = true;
    await persistir();
  }

  async function init() {
    if (ready) return store;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      if (!window.JCPAG_CONFIG) {
        throw new Error("JCPAG_CONFIG não carregado. Inclua config.example.js ou config.js antes dos scripts.");
      }
      store = await JCPagStore.carregar();
      if (!store.inicializado && cfg().DEMO_MODE) {
        await seedDemo();
      }
      sincronizarAtrasos();
      ready = true;
      return store;
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
    if (status === "pago") return { texto: "Pago", cls: "bg-emerald-100 text-emerald-700" };
    if (status === "atrasado") return { texto: "Atrasado", cls: "bg-rose-100 text-rose-700" };
    return { texto: "Pendente", cls: "bg-amber-100 text-amber-700" };
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

    const hash = await JCPagAuth.hashToken(t);
    const cliente = store.clientes.find((c) => c.ativo && c.tokenHash === hash);
    if (cliente) {
      await JCPagAuth.criarSessao("cliente", { clienteId: cliente.id, nome: cliente.nome });
      JCPagAuth.limparFalhasLogin();
      await registrarLog("Login realizado", "Portal do cliente", { nome: cliente.nome, tipo: "cliente" });
      return { ok: true, tipo: "cliente", redirect: JCPagGuard.ROUTES.cliente };
    }

    JCPagAuth.registrarFalhaLogin();
    return { ok: false, erro: "Token inválido ou expirado." };
  }

  async function logout() {
    const sessao = await JCPagAuth.validarSessao();
    if (sessao?.role === "admin") {
      await registrarLog("Logout", "Painel administrativo", getAutorAdmin());
    } else if (sessao?.role === "cliente") {
      const c = getCliente(sessao.clienteId);
      if (c) await registrarLog("Logout", "Portal do cliente", { nome: c.nome, tipo: "cliente" });
    }
    JCPagAuth.destruirSessao();
    window.location.href = JCPagGuard.ROUTES.login;
  }

  async function getClienteLogado() {
    const sessao = await JCPagAuth.validarSessao();
    if (!sessao || sessao.role !== "cliente") return null;
    await init();
    const c = getCliente(sessao.clienteId);
    return c?.ativo ? c : null;
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
    const sessao = await JCPagGuard.exigirCliente();
    if (!sessao) throw new Error("Sessão cliente inválida");

    const p = store.parcelas.find((x) => x.id === parcelaId);
    if (!p || p.clienteId !== sessao.clienteId) {
      throw new Error("Parcela não pertence a este cliente.");
    }
    if (p.status === "pago") throw new Error("Parcela já está paga.");

    const cliente = getCliente(p.clienteId);
    await registrarLog(
      "Pagamento Pix solicitado",
      `${cliente?.nome} · ${p.numero}ª · ${formatarMoeda(p.valor)} · venc. ${formatarData(p.vencimento)}`,
      await getAutorCliente(),
    );
    return p;
  }

  async function resetarSistema() {
    await exigirSessaoAdmin();
    store = await JCPagStore.resetar();
    if (cfg().DEMO_MODE) await seedDemo();
    else {
      store.inicializado = true;
      await persistir();
    }
    await registrarLog("Sistema resetado", "Base zerada pelo administrador", getAutorAdmin());
    return store;
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
    adicionarCliente,
    atualizarCliente,
    criarContrato,
    marcarParcelaPaga,
    registrarPagamentoPix,
    resetarSistema,
    guard: JCPagGuard,
    cfg,
  });
})();
