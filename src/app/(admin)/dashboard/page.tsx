"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, DollarSign, TrendingUp, Users, CreditCard, ArrowUpDown } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Divida {
  id: string
  devedor: { nome: string; telefone?: string }
  valor_original: number
  descricao?: string
  createdAt: string
  total_pago: number
  saldo_devedor: number
  ativa: boolean
}

export default function Dashboard() {
  const [dividas, setDividas] = useState<Divida[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [ordenar, setOrdenar] = useState('data')

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
    window.location.href = '/login'
  }

  const dividasFiltradas = dividas
    .filter((divida) =>
      divida.devedor.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      divida.descricao?.toLowerCase().includes(filtro.toLowerCase())
    )
    .sort((a, b) => {
      if (ordenar === 'valor') return b.valor_original - a.valor_original
      if (ordenar === 'pago') return b.total_pago - a.total_pago
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const totalGeral = dividas.reduce((acc, d) => acc + Number(d.valor_original), 0)
  const totalPago = dividas.reduce((acc, d) => acc + d.total_pago, 0)
  const totalReceber = totalGeral - totalPago
  const totalDevedores = new Set(dividas.map(d => d.devedor.id)).size

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JC Soluções
              </h1>
              <p className="text-gray-600 mt-1">Sistema de Gestão Financeira</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dividas/cadastrar"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Nova Dívida
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Geral</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGeral)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pago</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPago)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total a Receber</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceber)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <CreditCard className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Devedores</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalDevedores}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="data">Mais Recentes</option>
                <option value="valor">Maior Valor</option>
                <option value="pago">Maior Pago</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Dívidas */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Dívidas Cadastradas</h2>
            <span className="text-sm text-gray-500">
              {dividasFiltradas.length} de {dividas.length} dívidas
            </span>
          </div>

          {dividasFiltradas.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">Nenhuma dívida encontrada</p>
              <Link
                href="/dividas/cadastrar"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Cadastrar Primeira Dívida
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {dividasFiltradas.map((divida) => (
                <div
                  key={divida.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/dividas/${divida.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{divida.devedor.nome}</h3>
                        {divida.ativa ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Ativa
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                            Inativa
                          </span>
                        )}
                      </div>
                      {divida.descricao && (
                        <p className="text-sm text-gray-600 mb-2">{divida.descricao}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Pago: R$ {divida.total_pago.toFixed(2)}</span>
                        <span>•</span>
                        <span>Restante: R$ {divida.saldo_devedor.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        R$ {divida.valor_original.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(divida.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
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