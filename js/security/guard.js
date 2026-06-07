/**
 * ============================================================================
 * JCPag — Guardas de rota e permissões (NÃO EDITAR)
 * Toda página protegida DEVE chamar JCPagGuard antes de renderizar dados.
 * ============================================================================
 */
"use strict";

window.JCPagGuard = (function () {
  const ROUTES = Object.freeze({
    login: "index.html",
    admin: "admin.html",
    cliente: "cliente.html",
  });

  async function exigirAdmin() {
    const sessao = await JCPagAuth.validarSessao();
    if (!sessao || sessao.role !== "admin") {
      window.location.replace(ROUTES.login);
      return null;
    }
    return sessao;
  }

  async function exigirCliente() {
    const sessao = await JCPagAuth.validarSessao();
    if (!sessao || sessao.role !== "cliente" || !sessao.clienteId) {
      window.location.replace(ROUTES.login);
      return null;
    }
    return sessao;
  }

  async function redirecionarSeLogado() {
    const sessao = await JCPagAuth.validarSessao();
    if (!sessao) return false;
    if (sessao.role === "admin") {
      window.location.replace(ROUTES.admin);
      return true;
    }
    if (sessao.role === "cliente") {
      window.location.replace(ROUTES.cliente);
      return true;
    }
    return false;
  }

  function negarSeCliente() {
    return { ok: false, erro: "Ação permitida somente para administrador." };
  }

  return Object.freeze({
    ROUTES,
    exigirAdmin,
    exigirCliente,
    redirecionarSeLogado,
    negarSeCliente,
  });
})();
