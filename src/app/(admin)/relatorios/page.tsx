'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Divida {
  id: string
  devedor: { nome: string }
  valor_original: number
  descricao?: string
  ativa: boolean
  criado_em: string
  total_pago: number
  saldo_devedor: number
}

export default function RelatoriosPage() {
  const [dividas, setDividas] = useState<Divida[]>([])
  const [loading, setLoading] = useState(false)
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'ativas' | 'inativas'>('todas')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const carregarDividas = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dividas')
      const data = await res.json()
      setDividas(data)
    } finally {
      setLoading(false)
    }
  }

  const dividasFiltradas = dividas.filter((divida) => {
    if (filtroStatus === 'ativas' && !divida.ativa) return false
    if (filtroStatus === 'inativas' && divida.ativa) return false
    if (filtroNome && !divida.devedor.nome.toLowerCase().includes(filtroNome.toLowerCase()))
      return false
    if (dataInicio && new Date(divida.criado_em) < new Date(dataInicio)) return false
    if (dataFim && new Date(divida.criado_em) > new Date(dataFim)) return false
    return true
  })

  const exportarExcel = () => {
    const dados = dividasFiltradas.map((divida) => ({
      'Devedor': divida.devedor.nome,
      'Valor Original': Number(divida.valor_original).toFixed(2),
      'Total Pago': divida.total_pago.toFixed(2),
      'Saldo Devedor': divida.saldo_devedor.toFixed(2),
      'Status': divida.ativa ? 'Ativa' : 'Inativa',
      'Data Criação': new Date(divida.criado_em).toLocaleDateString('pt-BR'),
      'Descrição': divida.descricao || '',
    }))

    const ws = XLSX.utils.json_to_sheet(dados)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Dívidas')
    XLSX.writeFile(wb, `Relatorio_Dividas_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportarPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Relatório de Dívidas - JC Soluções', 14, 22)

    doc.setFontSize(11)
    doc.text(
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      14,
      32
    )

    const linhas = dividasFiltradas.map((divida) => [
      divida.devedor.nome,
      `R$ ${Number(divida.valor_original).toFixed(2)}`,
      `R$ ${divida.total_pago.toFixed(2)}`,
      `R$ ${divida.saldo_devedor.toFixed(2)}`,
      divida.ativa ? 'Ativa' : 'Inativa',
      new Date(divida.criado_em).toLocaleDateString('pt-BR'),
    ])

    autoTable(doc, {
      head: [
        ['Devedor', 'Valor Original', 'Total Pago', 'Saldo', 'Status', 'Criação'],
      ],
      body: linhas,
      startY: 40,
    })

    doc.save(`Relatorio_Dividas_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nome do devedor"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <select
              value={filtroStatus}
              onChange={(e) =>
                setFiltroStatus(e.target.value as 'todas' | 'ativas' | 'inativas')
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="todas">Todas</option>
              <option value="ativas">Ativas</option>
              <option value="inativas">Inativas</option>
            </select>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Início"
            />
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Fim"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={carregarDividas}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Carregar Dados
            </button>
            <button
              onClick={exportarExcel}
              disabled={dividasFiltradas.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exportar Excel
            </button>
            <button
              onClick={exportarPDF}
              disabled={dividasFiltradas.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exportar PDF
            </button>
          </div>
        </div>

        {dividasFiltradas.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resultados ({dividasFiltradas.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Devedor</th>
                    <th className="text-right py-2">Valor Original</th>
                    <th className="text-right py-2">Total Pago</th>
                    <th className="text-right py-2">Saldo</th>
                    <th className="text-center py-2">Status</th>
                    <th className="text-center py-2">Criação</th>
                  </tr>
                </thead>
                <tbody>
                  {dividasFiltradas.map((divida) => (
                    <tr key={divida.id} className="border-b">
                      <td className="py-2">{divida.devedor.nome}</td>
                      <td className="text-right">
                        R$ {Number(divida.valor_original).toFixed(2)}
                      </td>
                      <td className="text-right text-green-600">
                        R$ {divida.total_pago.toFixed(2)}
                      </td>
                      <td className="text-right text-red-600">
                        R$ {divida.saldo_devedor.toFixed(2)}
                      </td>
                      <td className="text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            divida.ativa
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {divida.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="text-center">
                        {new Date(divida.criado_em).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
