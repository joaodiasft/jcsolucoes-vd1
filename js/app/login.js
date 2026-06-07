/**
 * Tela de login — usa apenas JCPag.login() (validação no núcleo)
 */
"use strict";

document.addEventListener("DOMContentLoaded", async function () {
  try {
    await JCPag.init();
    if (await JCPag.guard.redirecionarSeLogado()) return;
  } catch (e) {
    document.getElementById("login-erro").textContent = e.message;
    document.getElementById("login-erro").classList.remove("hidden");
    return;
  }

  const demoBox = document.getElementById("demo-box");
  if (demoBox && JCPag.cfg().DEMO_MODE && JCPag.cfg().TOKENS_DEMO) {
    demoBox.classList.remove("hidden");
    const demo = JCPag.cfg().TOKENS_DEMO;
    document.getElementById("demo-admin-token").textContent = demo.admin.token;
    document.getElementById("demo-cliente-token").textContent = demo.cliente.token;
  }

  if (JCPag.cfg().DEMO_MODE) {
    document.getElementById("banner-demo")?.classList.remove("hidden");
  }

  async function entrar(token) {
    const btn = document.getElementById("btn-login");
    const btnText = document.getElementById("btn-text");
    const erro = document.getElementById("login-erro");

    btn.disabled = true;
    btnText.textContent = "Validando token...";
    erro.classList.add("hidden");

    const result = await JCPag.login(token);
    if (!result.ok) {
      btn.disabled = false;
      btnText.textContent = "Entrar no sistema";
      erro.textContent = result.erro;
      erro.classList.remove("hidden");
      return;
    }
    window.location.href = result.redirect;
  }

  document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    entrar(document.getElementById("token").value);
  });

  document.querySelectorAll("[data-demo]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const role = btn.dataset.demo;
      const demo = JCPag.cfg().TOKENS_DEMO?.[role];
      if (!demo) return;
      document.getElementById("token").value = demo.token;
      entrar(demo.token);
    });
  });
});
