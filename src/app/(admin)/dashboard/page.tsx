"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, DollarSign, TrendingUp, Users, CreditCard, ExternalLink, Edit2, Trash2, Copy, Check, Eye } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Divida {
  id: string
  devedor: { id: string; nome: string; telefone?: string }
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
  const [copiedId, setCopiedId] = useState('')

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

  const handleCopiarLink = (id: string) => {
    const link = `${window.location.origin}/c/${id}`
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(''), 2000)
    toast.success('Link copiado!')
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
  const progressoGeral = totalGeral > 0 ? (totalPago / totalGeral) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Toaster />
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">JC Solucoes</h1>
              <p className="text-gray-600 mt-1 text-sm">Sistema de Gestao Financeira</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dividas/cadastrar" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium">
                <Plus className="w-5 h-5" />Nova Divida
              </Link>
              <button onClick={handleLogout} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg font-medium">Sair</button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Geral</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGeral)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full"><DollarSign className="w-8 h-8 text-blue-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pago</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPago)}</p>
                <p className="text-xs text-gray-500 mt-1">{progressoGeral.toFixed(1)}% do total</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full"><TrendingUp className="w-8 h-8 text-green-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total a Receber</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceber)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full"><CreditCard className="w-8 h-8 text-red-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Devedores</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalDevedores}</p>
                <p className="text-xs text-gray-500 mt-1">{dividas.length} dividas</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full"><Users className="w-8 h-8 text-purple-600" /></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Buscar por nome ou descricao..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option value="data">Mais Recentes</option>
                <option value="valor">Maior Valor</option>
                <option value="pago">Maior Pago</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Dividas Cadastradas</h2>
            <span className="text-sm text-gray-500 font-medium">{dividasFiltradas.length} de {dividas.length} dividas</span>
          </div>
          {dividasFiltradas.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"><Search className="w-12 h-12 text-gray-400" /></div>
              <p className="text-gray-500 text-lg mb-4">Nenhuma divida encontrada</p>
              <Link href="/dividas/cadastrar" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"><Plus className="w-5 h-5" />Cadastrar Primeira Divida</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {dividasFiltradas.map((divida) => {
                const progresso = (divida.total_pago / divida.valor_original) * 100
                return (
                  <div key={divida.id} className="p-6 hover:bg-gray-50 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{divida.devedor.nome}</h3>
                          {divida.ativa ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>Ativa</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>Inativa</span>
                          )}
                        </div>
                        {divida.descricao && <p className="text-sm text-gray-600 mb-2 truncate">{divida.descricao}</p>}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-600" />Pago: R$ {divida.total_pago.toFixed(2)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-red-600" />Restante: R$ {divida.saldo_devedor.toFixed(2)}</span>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(progresso, 100)}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{progresso.toFixed(0)}% pago</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-gray-900">R$ {divida.valor_original.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{new Date(divida.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); router.push(`/dividas/${divida.id}`; }} className="p-2 hover:bg-blue-100 rounded-lg transition-colors" title="Ver detalhes"><Eye className="w-5 h-5 text-blue-600" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleCopiarLink(divida.id); }} className="p-2 hover:bg-green-100 rounded-lg transition-colors" title="Copiar link">{copiedId === divida.id ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-green-600" />}</button>
                        <a href={`/c/${divida.id}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-purple-100 rounded-lg transition-colors" title="Ver como devedor"><ExternalLink className="w-5 h-5 text-purple-600" /></a>
                        <button onClick={(e) => { e.stopPropagation(); router.push(`/dividas/${divida.id}`; }} className="p-2 hover:bg-orange-100 rounded-lg transition-colors" title="Editar"><Edit2 className="w-5 h-5 text-orange-600" /></button>
                        <button onClick={(e) => { e.stopPropagation(); if (confirm('Tem certeza que deseja excluir?')) { fetch(`/api/dividas/${divida.id}`, { method: 'DELETE' }).then(() => window.location.reload()); }} } className="p-2 hover:bg-red-100 rounded-lg transition-colors" title="Excluir"><Trash2 className="w-5 h-5 text-red-600" /></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}