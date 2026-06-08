"use strict";

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 3500);
}

async function renderTudo() {
  await JCPag.init();
  renderKPIs();
  renderClientes();
  renderContratos();
  renderFinanceiro();
  renderLogs();
  preencherSelectClientes();
}

function renderContratos() {
  const tbody = document.getElementById("contracts-table-body");
  const contratos = JCPag.dados.contratos || [];

  if (!contratos.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="jcpag-empty">Nenhum contrato cadastrado. Use Nova venda.</td></tr>';
    return;
  }

  tbody.innerHTML = [...contratos]
    .sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""))
    .map((ct) => {
      const cliente = JCPag.getCliente(ct.clienteId);
      const qtdParcelas = JCPag.dados.parcelas.filter((p) => p.contratoId === ct.id).length;
      return `<tr>
        <td><strong>${cliente ? cliente.nome : "—"}</strong></td>
        <td>${ct.servico}</td>
        <td style="color: var(--jc-muted)">${JCPag.formatarData(ct.dataInicio)}</td>
        <td class="text-center"><strong>${qtdParcelas || ct.parcelas || 0}</strong></td>
        <td class="text-right"><strong>${JCPag.formatarMoeda(ct.valorTotal)}</strong></td>
        <td class="text-center"><span class="jcpag-badge jcpag-badge--ok">${ct.status || "ativo"}</span></td>
      </tr>`;
    })
    .join("");
}

function renderClientes() {
  const tbody = document.getElementById("clients-table-body");
  const clientes = JCPag.dados.clientes;

  if (!clientes.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="jcpag-empty">Nenhum cliente cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = clientes
    .map((c) => {
      const qtd = JCPag.contratosDoCliente(c.id).length;
      return `<tr>
        <td><strong>${c.nome}</strong></td>
        <td style="color: var(--jc-muted)">${c.email}<br><small>${c.telefone || "—"}</small></td>
        <td><code class="jcpag-code">${c.tokenPreview}</code></td>
        <td class="text-center"><strong>${qtd}</strong></td>
        <td><button type="button" data-editar="${c.id}" class="jcpag-link-btn">Editar</button></td>
      </tr>`;
    })
    .join("");

  tbody.querySelectorAll("[data-editar]").forEach((btn) => {
    btn.addEventListener("click", () => abrirModalCliente(btn.dataset.editar));
  });
}

function renderFinanceiro() {
  const tbody = document.getElementById("financial-table-body");
  const parcelas = [...JCPag.dados.parcelas].sort((a, b) => a.vencimento.localeCompare(b.vencimento));

  if (!parcelas.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="jcpag-empty">Nenhuma movimentação.</td></tr>';
    return;
  }

  tbody.innerHTML = parcelas
    .map((p) => {
      const cliente = JCPag.getCliente(p.clienteId);
      const contrato = JCPag.getContrato(p.contratoId);
      const st = JCPag.statusLabel(p.status);
      const btn =
        p.status !== "pago"
          ? `<button type="button" data-pagar="${p.id}" class="jcpag-link-btn">Marcar pago</button>`
          : '<span style="color: var(--jc-muted); font-size: 0.75rem;">—</span>';

      return `<tr>
        <td>${cliente ? cliente.nome : "—"}</td>
        <td>${contrato ? contrato.servico : "—"}</td>
        <td>${p.numero}x</td>
        <td>${JCPag.formatarData(p.vencimento)}</td>
        <td class="text-right"><strong>${JCPag.formatarMoeda(p.valor)}</strong></td>
        <td class="text-center"><span class="${st.cls}">${st.texto}</span></td>
        <td class="text-center">${btn}</td>
      </tr>`;
    })
    .join("");

  tbody.querySelectorAll("[data-pagar]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await JCPag.marcarParcelaPaga(btn.dataset.pagar);
        toast("Parcela marcada como paga.");
        await renderTudo();
      } catch (e) {
        toast(e.message);
      }
    });
  });
}

function renderLogs() {
  const tbody = document.getElementById("logs-table-body");
  const logs = JCPag.dados.logs || [];

  if (!logs.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="jcpag-empty">Nenhuma ação registrada.</td></tr>';
    return;
  }

  tbody.innerHTML = logs
    .map((log) => {
      const badgeCls =
        log.tipoAutor === "admin"
          ? "jcpag-badge jcpag-badge--admin"
          : log.tipoAutor === "cliente"
            ? "jcpag-badge jcpag-badge--ok"
            : "jcpag-badge";
      return `<tr>
        <td style="color: var(--jc-muted); white-space: nowrap;">${JCPag.formatarDataHora(log.data)}</td>
        <td><span class="${badgeCls}">${log.autor}</span></td>
        <td><strong>${log.acao}</strong></td>
        <td style="color: var(--jc-muted)">${log.detalhes || "—"}</td>
      </tr>`;
    })
    .join("");
}

function renderKPIs() {
  const k = JCPag.calcularKPIs(JCPag.dados.parcelas);
  document.getElementById("dash-faturamento").textContent = JCPag.formatarMoeda(k.faturamento);
  document.getElementById("dash-recebido").textContent = JCPag.formatarMoeda(k.recebido);
  document.getElementById("dash-pendente").textContent = JCPag.formatarMoeda(k.pendente);
  document.getElementById("dash-atrasado").textContent = JCPag.formatarMoeda(k.atrasado);
}

function preencherSelectClientes() {
  document.getElementById("venda-cliente").innerHTML = JCPag.dados.clientes
    .map((c) => `<option value="${c.id}">${c.nome}</option>`)
    .join("");
}

function abrirModalCliente(id) {
  const modal = document.getElementById("modal-cliente");
  document.getElementById("cliente-id").value = id || "";
  document.getElementById("modal-cliente-titulo").textContent = id ? "Editar cliente" : "Novo cliente";
  document.getElementById("cliente-token-hint").textContent = id
    ? "Deixe vazio para manter o token atual. Se alterar, anote o novo token — não é recuperável."
    : "Opcional. Se vazio, um token será gerado e exibido uma única vez.";

  if (id) {
    const c = JCPag.getCliente(id);
    document.getElementById("cliente-nome").value = c.nome;
    document.getElementById("cliente-email").value = c.email;
    document.getElementById("cliente-telefone").value = c.telefone || "";
    document.getElementById("cliente-token").value = "";
  } else {
    document.getElementById("form-cliente").reset();
    document.getElementById("cliente-id").value = "";
  }
  modal.showModal();
}

document.addEventListener("DOMContentLoaded", async () => {
  let sessao;
  try {
    await JCPag.init();
    if (typeof JCPag.validarSessaoAtiva === "function") {
      sessao = await JCPag.validarSessaoAtiva();
      if (!sessao || sessao.role !== "admin") {
        window.location.replace("index.html");
        return;
      }
    } else {
      sessao = await JCPag.guard.exigirAdmin();
      if (!sessao) return;
    }
  } catch (e) {
    const msg = String(e.message || "");
    const amigavel = msg.includes("nuvem") || msg.includes("503")
      ? "Banco na nuvem acordando. Aguarde 1 minuto, atualize a página e use Atualizar banco."
      : msg;
    toast(amigavel);
    window.location.href = "index.html";
    return;
  }

  if (JCPag.dados?._avisoNuvem) {
    toast(JCPag.dados._avisoNuvem);
  }

  AdminSession.init(sessao);

  document.getElementById("venda-vencimento").value = JCPag.hoje();
  await renderTudo();

  document.getElementById("btn-sair").addEventListener("click", async () => {
    if (!confirm("Deseja encerrar sua sessão e voltar ao login?")) return;
    AdminSession.stop();
    await JCPag.logout("Logout manual");
  });
  document.getElementById("btn-novo-cliente").addEventListener("click", () => abrirModalCliente(null));
  document.getElementById("btn-nova-venda").addEventListener("click", () => {
    preencherSelectClientes();
    document.getElementById("modal-venda").showModal();
  });
  document.getElementById("btn-sync-banco").addEventListener("click", async () => {
    const btn = document.getElementById("btn-sync-banco");
    btn.disabled = true;
    try {
      const stats = await JCPag.sincronizarBanco();
      toast(
        stats.erroNuvem
          ? stats.erroNuvem
          : stats.changed
            ? `Nuvem atualizada · ${stats.ativos} login(s) ativo(s)`
            : `Banco na nuvem OK · ${stats.ativos} login(s) ativo(s)`,
      );
      await renderTudo();
    } catch (e) {
      toast(e.message);
    } finally {
      btn.disabled = false;
    }
  });
  document.getElementById("btn-reset").addEventListener("click", async () => {
    if (!confirm("Zerar TODOS os dados criptografados? Esta ação não pode ser desfeita.")) return;
    try {
      await JCPag.resetarSistema();
      toast("Sistema resetado.");
      await renderTudo();
    } catch (e) {
      toast(e.message);
    }
  });

  document.getElementById("btn-cancelar-cliente").addEventListener("click", () => {
    document.getElementById("modal-cliente").close();
  });
  document.getElementById("btn-cancelar-venda").addEventListener("click", () => {
    document.getElementById("modal-venda").close();
  });

  document.getElementById("form-cliente").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("cliente-id").value;
    const payload = {
      nome: document.getElementById("cliente-nome").value,
      email: document.getElementById("cliente-email").value,
      telefone: document.getElementById("cliente-telefone").value,
      token: document.getElementById("cliente-token").value,
    };

    try {
      if (id) {
        const r = await JCPag.atualizarCliente(id, payload);
        toast(r.tokenPlain ? `Cliente atualizado. Novo token: ${r.tokenPlain}` : "Cliente atualizado.");
      } else {
        const r = await JCPag.adicionarCliente(payload);
        toast(`Cliente criado. Token (guarde agora): ${r.tokenPlain}`);
      }
      document.getElementById("modal-cliente").close();
      await renderTudo();
    } catch (err) {
      toast(err.message);
    }
  });

  document.getElementById("form-venda").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await JCPag.criarContrato({
        clienteId: document.getElementById("venda-cliente").value,
        servico: document.getElementById("venda-servico").value,
        valorTotal: parseFloat(document.getElementById("venda-valor").value),
        parcelas: parseInt(document.getElementById("venda-parcelas").value, 10),
        primeiroVencimento: document.getElementById("venda-vencimento").value,
      });
      toast("Contrato criado.");
      document.getElementById("modal-venda").close();
      document.getElementById("form-venda").reset();
      document.getElementById("venda-vencimento").value = JCPag.hoje();
      await renderTudo();
    } catch (err) {
      toast(err.message);
    }
  });
});
