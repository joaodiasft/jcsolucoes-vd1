const DBSimulado = (() => {
    const STORAGE_KEY = 'jc_pagamentos_db_v1';

    const estadoInicial = {
        titulo: "",
        comprador: "",
        metodo: "Pix",
        valorTotal: 0,
        valorParcela: 0,
        parcelas: [],
        travado: false
    };

    function carregar() {
        try {
            const bruto = localStorage.getItem(STORAGE_KEY);
            if (!bruto) return { ...estadoInicial };
            const dados = JSON.parse(bruto);
            return { ...estadoInicial, ...dados };
        } catch (e) {
            return { ...estadoInicial };
        }
    }

    function salvar(dados) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    }

    function limpar() {
        localStorage.removeItem(STORAGE_KEY);
    }

    return { carregar, salvar, limpar, estadoInicial };
})();
