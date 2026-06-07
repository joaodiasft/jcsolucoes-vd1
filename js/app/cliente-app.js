"use strict";

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 3500);
}

function iniciais(nome) {
  return (nome || "C")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function setupHeader(cliente) {
  const primeiro = cliente.nome.split(" ")[0];
  document.getElementById("cliente-nome").textContent = "Olá, " + primeiro;
  document.getElementById("cliente-avatar").textContent = iniciais(cliente.nome);
}

async function renderDashboard() {
  const cliente = await JCPag.getClienteLogado();
  if (!cliente) {
    await JCPag.logout();
    return;
  }

  setupHeader(cliente);

  await JCPag.init();
  const contratos = JCPag.contratosDoCliente(cliente.id);
  const parcelas = JCPag.parcelasDoCliente(cliente.id);
  const pix = JCPag.cfg().PIX;

  const aberto = parcelas.filter((p) => p.status !== "pago");
  const totalAberto = aberto.reduce((s, p) => s + p.valor, 0);
  const proxima = [...aberto].sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0];
  const temAtraso = parcelas.some((p) => p.status === "atrasado");

  document.getElementById("dash-total-debt").textContent = JCPag.formatarMoeda(totalAberto);
  document.getElementById("dash-next-due").textContent = proxima ? JCPag.formatarData(proxima.vencimento) : "—";

  const statusEl = document.getElementById("dash-status");
  statusEl.textContent = temAtraso ? "Inadimplente" : contratos.length ? "Ativo" : "Sem contrato";
  statusEl.className = "text-2xl font-extrabold mt-1 " + (temAtraso ? "text-rose-600" : "text-emerald-600");

  const tbodyContratos = document.getElementById("contracts-table-body");
  tbodyContratos.innerHTML = contratos.length
    ? contratos
        .map(
          (c) => `<tr class="border-b border-slate-50 last:border-0">
        <td class="py-4 font-bold text-slate-900">${c.servico}</td>
        <td class="py-4 text-slate-500">${JCPag.formatarData(c.dataInicio)}</td>
        <td class="py-4 text-right font-bold">${JCPag.formatarMoeda(c.valorTotal)}</td>
        <td class="py-4 text-center"><span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">${c.status}</span></td>
      </tr>`,
        )
        .join("")
    : '<tr><td colspan="4" class="py-4 text-center text-slate-400">Nenhum contrato ativo.</td></tr>';

  const tbodyPag = document.getElementById("payments-table-body");
  if (!parcelas.length) {
    tbodyPag.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-400">Nenhuma fatura.</td></tr>';
    return;
  }

  tbodyPag.innerHTML = [...parcelas]
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .map((p) => {
      const st = JCPag.statusLabel(p.status);
      const acao =
        p.status !== "pago"
          ? `<button type="button" data-pix="${p.id}" class="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-indigo-700">Pagar Pix</button>`
          : '<span class="text-slate-300 text-xs italic">Comprovante OK</span>';

      return `<tr class="border-b border-slate-50 last:border-0">
        <td class="py-4 text-slate-600">${p.numero}ª parcela</td>
        <td class="py-4 text-slate-600">${JCPag.formatarData(p.vencimento)}</td>
        <td class="py-4 text-right font-bold text-slate-900">${JCPag.formatarMoeda(p.valor)}</td>
        <td class="py-4 text-center"><span class="px-2 py-1 rounded-full text-[10px] font-bold ${st.cls}">${st.texto}</span></td>
        <td class="py-4 text-center">${acao}</td>
      </tr>`;
    })
    .join("");

  tbodyPag.querySelectorAll("[data-pix]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const parcelaId = btn.dataset.pix;
      const parcela = JCPag.dados.parcelas.find((p) => p.id === parcelaId);
      if (!parcela) return;

      try {
        await JCPag.registrarPagamentoPix(parcelaId);
      } catch (e) {
        toast(e.message);
        return;
      }

      document.getElementById("pix-parcela").textContent =
        parcela.numero + "ª parcela · venc. " + JCPag.formatarData(parcela.vencimento);
      document.getElementById("pix-valor").textContent = JCPag.formatarMoeda(parcela.valor);
      document.getElementById("pix-email").textContent = pix.email;
      document.getElementById("pix-banco").textContent = pix.banco;
      document.getElementById("pix-nome").textContent = pix.nome;
      document.getElementById("modal-pix").showModal();
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await JCPag.init();
    const sessao = await JCPag.guard.exigirCliente();
    if (!sessao) return;
  } catch (e) {
    alert(e.message);
    window.location.href = "index.html";
    return;
  }

  await renderDashboard();

  document.getElementById("btn-fechar-pix").addEventListener("click", () => {
    document.getElementById("modal-pix").close();
  });

  document.getElementById("btn-copiar-pix").addEventListener("click", () => {
    navigator.clipboard.writeText(JCPag.cfg().PIX.email).then(() => toast("E-mail Pix copiado!"));
  });

  document.getElementById("btn-sair").addEventListener("click", async () => {
    if (!confirm("Deseja encerrar sua sessão e voltar ao login?")) return;
    await JCPag.logout("Logout manual");
  });
});
