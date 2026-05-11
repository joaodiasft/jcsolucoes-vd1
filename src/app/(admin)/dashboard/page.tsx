"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Divida {
  id: string
  devedor: { nome: string; telefone?: string }
  valor_original: number
  descricao?: string
  createdAt: string
  total_pago: number
  saldo_devedor: number
}

export default function Dashboard() {
  const router = useRouter()
  const [dividas, setDividas] = useState<Divida[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dividas')
      .then((res) => res.json())
      .then((data) => {
        setDividas(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard - JC Soluções
            </h1>
          </div>
          <div className="flex gap-4">
            <Link
              href="/dividas/cadastrar"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Nova Dívida
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          {dividas.length === 0 ? (
            <p className="text-gray-500">Nenhuma dívida cadastrada.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dividas.map((divida) => (
                <div key={divida.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {divida.devedor.nome}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Valor: R$ {divida.valor_original.toFixed(2)}
                  </p>
                  <p className="text-gray-600">
                    Pago: R$ {divida.total_pago.toFixed(2)}
                  </p>
                  <p className="text-red-600 font-semibold mt-2">
                    Restante: R$ {divida.saldo_devedor.toFixed(2)}
                  </p>
                  <div className="mt-4 space-y-2">
                    <Link
                      href={`/dividas/${divida.id}`}
                      className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
