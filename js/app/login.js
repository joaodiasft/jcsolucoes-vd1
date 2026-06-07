/**
 * Tela de login — produção (sem atalhos ou indicação de perfil)
 */
"use strict";

document.addEventListener("DOMContentLoaded", async function () {
  try {
    await JCPag.init();
    const sessao = await JCPag.validarSessaoAtiva();
    if (sessao?.role === "admin") {
      window.location.replace(JCPag.guard.ROUTES.admin);
      return;
    }
    if (sessao?.role === "cliente") {
      window.location.replace(JCPag.guard.ROUTES.cliente);
      return;
    }
  } catch (e) {
    document.getElementById("login-erro").textContent = e.message;
    document.getElementById("login-erro").classList.remove("hidden");
    return;
  }

  async function entrar(token) {
    const btn = document.getElementById("btn-login");
    const btnText = document.getElementById("btn-text");
    const erro = document.getElementById("login-erro");

    btn.disabled = true;
    btnText.textContent = "Validando...";
    erro.classList.add("hidden");

    const result = await JCPag.login(token);
    if (!result.ok) {
      btn.disabled = false;
      btnText.textContent = "Entrar";
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
});
