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

function setupHeader(nome) {
  const display = String(nome || "Cliente").trim();
  const primeiro = display.split(" ").filter(Boolean)[0] || "Cliente";
  const nomeEl = document.getElementById("cliente-nome");
  const avatarEl = document.getElementById("cliente-avatar");
  if (nomeEl) nomeEl.textContent = "Olá, " + primeiro;
  if (avatarEl) avatarEl.textContent = iniciais(display);
}

function renderEstadoCarregando() {
  document.getElementById("contracts-table-body").innerHTML =
    '<tr><td colspan="4" class="py-6 text-center text-slate-400">Carregando contratos…</td></tr>';
  document.getElementById("payments-table-body").innerHTML =
    '<tr><td colspan="5" class="py-6 text-center text-slate-400">Carregando faturas…</td></tr>';
}

async function renderDashboard(cliente) {
  const contratos = JCPag.contratosDoCliente(cliente.id);
  const parcelas = JCPag.parcelasDoCliente(cliente.id);
  const pix = JCPag.cfg().PIX;

  setupHeader(cliente.nome);

  if (cliente._sessaoOrfa) {
    toast("Cadastro não encontrado na base. Peça ao administrador para recadastrar seu acesso.");
  }

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
    : '<tr><td colspan="4" class="py-6 text-center text-slate-400">Nenhum contrato vinculado à sua conta.</td></tr>';

  const tbodyPag = document.getElementById("payments-table-body");
  if (!parcelas.length) {
    tbodyPag.innerHTML =
      '<tr><td colspan="5" class="py-6 text-center text-slate-400">Nenhuma fatura disponível no momento.</td></tr>';
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
  renderEstadoCarregando();

  try {
    await JCPag.init();
    const cliente = await JCPag.getClienteLogado();
    if (!cliente) {
      window.location.replace("index.html");
      return;
    }

    setupHeader(cliente.nome);
    await renderDashboard(cliente);
  } catch (e) {
    console.error("[ClienteApp]", e);
    setupHeader("Cliente");
    document.getElementById("cliente-sessao-status").innerHTML =
      '<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Erro ao carregar';
    document.getElementById("contracts-table-body").innerHTML =
      '<tr><td colspan="4" class="py-6 text-center text-rose-500 font-semibold">Não foi possível carregar seus dados.</td></tr>';
    document.getElementById("payments-table-body").innerHTML =
      '<tr><td colspan="5" class="py-6 text-center text-slate-400">—</td></tr>';
    alert(e.message || "Erro ao carregar o painel. Tente fazer login novamente.");
    window.location.replace("index.html");
    return;
  }

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
