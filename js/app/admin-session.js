/**
 * Sessão do painel de gestão — inatividade e cabeçalho do usuário
 */
"use strict";

window.AdminSession = (function () {
  const WARNING_SEC = 30;

  let idleMs = 5 * 60 * 1000;
  let lastActivity = Date.now();
  let tickId = null;
  let warningShown = false;
  let modal = null;
  let countdownEl = null;
  let statusEl = null;

  function idleMinutes() {
    const min = window.JCPAG_CONFIG?.ADMIN_IDLE_MINUTES;
    return typeof min === "number" && min > 0 ? min : 5;
  }

  function iniciais(nome) {
    return (nome || "A")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  }

  function setupHeader(sessao) {
    const nome = sessao?.nome || JCPag.cfg().ADMIN_NOME;
    document.getElementById("admin-nome").textContent = nome;
    document.getElementById("admin-avatar").textContent = iniciais(nome);
  }

  function setStatus(ativo) {
    if (!statusEl) return;
    if (ativo) {
      statusEl.className =
        "text-[10px] font-semibold text-emerald-600 flex items-center gap-1";
      statusEl.innerHTML =
        '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Sessão ativa';
    } else {
      statusEl.className =
        "text-[10px] font-semibold text-amber-600 flex items-center gap-1";
      statusEl.innerHTML =
        '<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Expirando…';
    }
  }

  function touch() {
    lastActivity = Date.now();
    if (warningShown) {
      warningShown = false;
      modal?.close();
      setStatus(true);
    }
  }

  function updateCountdown(sec) {
    if (countdownEl) countdownEl.textContent = String(Math.max(0, sec));
  }

  async function logoutInatividade() {
    const min = idleMinutes();
    await JCPag.logout(`Sessão encerrada por inatividade (${min} min)`);
  }

  function tick() {
    const idle = Date.now() - lastActivity;
    const warnAt = idleMs - WARNING_SEC * 1000;

    if (idle >= idleMs) {
      stop();
      logoutInatividade();
      return;
    }

    if (idle >= warnAt) {
      if (!warningShown) {
        warningShown = true;
        setStatus(false);
        modal?.showModal();
      }
      updateCountdown(Math.ceil((idleMs - idle) / 1000));
    }
  }

  function startListeners() {
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => document.addEventListener(e, touch, { passive: true }));

    let lastMove = 0;
    document.addEventListener(
      "mousemove",
      () => {
        if (Date.now() - lastMove > 3000) {
          lastMove = Date.now();
          touch();
        }
      },
      { passive: true },
    );
  }

  function init(sessao) {
    idleMs = idleMinutes() * 60 * 1000;
    modal = document.getElementById("modal-idle");
    countdownEl = document.getElementById("idle-countdown");
    statusEl = document.getElementById("admin-sessao-status");

    setupHeader(sessao);
    startListeners();

    document.getElementById("btn-idle-manter")?.addEventListener("click", touch);

    modal?.addEventListener("cancel", (e) => {
      e.preventDefault();
      touch();
    });

    lastActivity = Date.now();
    tickId = setInterval(tick, 1000);
  }

  function stop() {
    if (tickId) clearInterval(tickId);
    tickId = null;
  }

  return Object.freeze({ init, stop, touch });
})();
