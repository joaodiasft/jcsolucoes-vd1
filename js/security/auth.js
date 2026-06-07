/**
 * ============================================================================
 * JCPag — Autenticação e hash de tokens (NÃO EDITAR)
 * Tokens nunca são persistidos em texto puro — apenas hash SHA-256 + pepper
 * ============================================================================
 */
"use strict";

window.JCPagAuth = (function () {
  const SESSAO_KEY = "jc-pag-sessao-v2";
  const LOGIN_ATTEMPTS_KEY = "jc-pag-login-attempts";
  const MAX_TENTATIVAS = 5;
  const BLOQUEIO_MS = 15 * 60 * 1000;
  const SESSAO_TTL_MS = 8 * 60 * 60 * 1000;

  function cfg() {
    return window.JCPAG_CONFIG;
  }

  function normalizarToken(valor) {
    return String(valor || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  async function hashToken(token) {
    const t = normalizarToken(token);
    const pepper = cfg().TOKEN_PEPPER;
    if (!pepper || pepper.length < 16) {
      throw new Error("JCPAG_CONFIG.TOKEN_PEPPER inválido.");
    }
    return JCPagCrypto.sha256Hex(t + pepper);
  }

  function tokenPreview(token) {
    const t = normalizarToken(token);
    if (t.length <= 4) return "****";
    return t.slice(0, 4) + "***";
  }

  function getLoginAttempts() {
    try {
      return JSON.parse(sessionStorage.getItem(LOGIN_ATTEMPTS_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function setLoginAttempts(data) {
    sessionStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(data));
  }

  function verificarBloqueioLogin() {
    const a = getLoginAttempts();
    if (a.bloqueadoAte && Date.now() < a.bloqueadoAte) {
      const min = Math.ceil((a.bloqueadoAte - Date.now()) / 60000);
      return { bloqueado: true, minutos: min };
    }
    return { bloqueado: false };
  }

  function registrarFalhaLogin() {
    const a = getLoginAttempts();
    a.count = (a.count || 0) + 1;
    if (a.count >= MAX_TENTATIVAS) {
      a.bloqueadoAte = Date.now() + BLOQUEIO_MS;
      a.count = 0;
    }
    setLoginAttempts(a);
  }

  function limparFalhasLogin() {
    sessionStorage.removeItem(LOGIN_ATTEMPTS_KEY);
  }

  async function assinarSessao(payload) {
    const { sig, ...rest } = payload;
    const msg = JSON.stringify(rest);
    return JCPagCrypto.hmacSign(msg, cfg().SESSION_PEPPER);
  }

  async function criarSessao(role, dados) {
    const sessao = {
      v: 2,
      role,
      sid: JCPagCrypto.randomSid(),
      exp: Date.now() + SESSAO_TTL_MS,
      ...dados,
    };
    sessao.sig = await assinarSessao(sessao);
    sessionStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
    return sessao;
  }

  async function validarSessao() {
    try {
      const raw = sessionStorage.getItem(SESSAO_KEY);
      if (!raw) return null;
      const sessao = JSON.parse(raw);
      if (!sessao?.v || !sessao.sig || !sessao.exp) return null;
      if (Date.now() > sessao.exp) {
        sessionStorage.removeItem(SESSAO_KEY);
        return null;
      }
      const { sig, ...rest } = sessao;
      const ok = await JCPagCrypto.hmacVerify(JSON.stringify(rest), sig, cfg().SESSION_PEPPER);
      if (!ok) {
        sessionStorage.removeItem(SESSAO_KEY);
        return null;
      }
      return sessao;
    } catch {
      sessionStorage.removeItem(SESSAO_KEY);
      return null;
    }
  }

  function destruirSessao() {
    sessionStorage.removeItem(SESSAO_KEY);
  }

  async function validarTokenAdmin(token) {
    const hash = await hashToken(token);
    return hash === cfg().ADMIN_TOKEN_HASH;
  }

  return Object.freeze({
    SESSAO_KEY,
    SESSAO_TTL_MS,
    normalizarToken,
    hashToken,
    tokenPreview,
    verificarBloqueioLogin,
    registrarFalhaLogin,
    limparFalhasLogin,
    criarSessao,
    validarSessao,
    destruirSessao,
    validarTokenAdmin,
  });
})();
