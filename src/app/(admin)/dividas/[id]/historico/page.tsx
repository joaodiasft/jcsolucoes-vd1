'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Auditoria {
  id: string
  acao: string
  tabela: string
  registro_id: string | null
  dados_anteriores: any
  dados_novos: any
  usuario_id: string | null
  criado_em: string
  usuario: { email: string } | null
}

export default function HistoricoPage() {
  const params = useParams()
  const [logs, setLogs] = useState<Auditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroAcao, setFiltroAcao] = useState('')

  useEffect(() => {
    const dividaId = params?.id as string
    if (!dividaId) return

    fetch(`/api/dividas/${dividaId}/historico`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params])

  const logsFiltrados = logs.filter((log) => {
    if (filtroAcao && log.acao !== filtroAcao.toUpperCase()) return false
    return true
  })

  const acoes = [...new Set(logs.map((log) => log.acao))]

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Auditoria</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6 flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Filtrar por ação:</label>
            <select
              value={filtroAcao}
              onChange={(e) => setFiltroAcao(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todas</option>
              {acoes.map((acao) => (
                <option key={acao} value={acao}>
                  {acao}
                </option>
              ))}
            </select>
          </div>

          {logsFiltrados.length === 0 ? (
            <p className="text-gray-500">Nenhum registro de auditoria encontrado.</p>
          ) : (
            <div className="space-y-4">
              {logsFiltrados.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                        {log.acao}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        em {log.tabela}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(log.criado_em).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {log.usuario && (
                    <p className="text-sm text-gray-600 mb-2">
                      Usuário: {log.usuario.email}
                    </p>
                  )}

                  {log.dados_anteriores && (
                    <details className="mt-2">
                      <summary className="text-sm text-blue-600 cursor-pointer">
                        Ver dados anteriores
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(log.dados_anteriores, null, 2)}
                      </pre>
                    </details>
                  )}

                  {log.dados_novos && (
                    <details className="mt-2">
                      <summary className="text-sm text-green-600 cursor-pointer">
                        Ver dados novos
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(log.dados_novos, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
