"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, Plus, DollarSign, Calendar, User, ChevronLeft, Copy, Check, Send, ArrowLeft, Edit2, Save, X } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Divida {
  id: string
  devedor: { id: string; nome: string; telefone?: string }
  valor_original: number | string
  descricao?: string
  data_vencimento?: string
  ativa: boolean
  pagamentos: Array<{
    id: string
    valor: number | string
    data_pagamento: string
  }>
}

export default function DividaDetalhes() {
  const params = useParams()
  const router = useRouter()
  const [divida, setDivida] = useState<Divida | null>(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    valor_original: '',
    descricao: '',
    data_vencimento: '',
    ativa: true,
  })
  const [copied, setCopied] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchDivida = () => {
    const id = params.id as string
    if (id) {
      setLoading(true)
      fetch(`/api/dividas/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.devedor) {
            setDivida(data)
            setFormData({
              nome: data.devedor.nome,
              telefone: data.devedor.telefone || '',
              valor_original: data.valor_original.toString(),
              descricao: data.descricao || '',
              data_vencimento: data.data_vencimento ? new Date(data.data_vencimento).toISOString().split('T')[0] : '',
              ativa: data.ativa,
            })
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }

  useEffect(() => {
    fetchDivida()
  }, [params.id, refreshKey])

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/dividas/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Dívida atualizada com sucesso!')
        setEditando(false)
        setRefreshKey(prev => prev + 1)
        fetchDivida()
      } else {
        toast.error('Erro ao atualizar')
      }
    } catch (error) {
      toast.error('Erro de conexão')
    }
  }

  const handleExcluir = async () => {
    if (confirm('Tem certeza que deseja excluir esta dívida? Esta ação não pode ser desfeita.')) {
      try {
        const res = await fetch(`/api/dividas/${params.id}`, {
          method: 'DELETE',
        })

        if (res.ok) {
          toast.success('Dívida excluída com sucesso!')
          setTimeout(() => router.push('/dashboard'), 1500)
        } else {
          toast.error('Erro ao excluir')
        }
      } catch (error) {
        toast.error('Erro de conexão')
      }
    }
  }

  const handleCopiarDados = () => {
    if (!divida) return
    
    const texto = `
Dívida: ${divida.devedor.nome}
Valor: R$ ${Number(divida.valor_original).toFixed(2)}
Pago: R$ ${divida.pagamentos.reduce((acc, p) => acc + Number(p.valor), 0).toFixed(2)}
Restante: R$ ${(Number(divida.valor_original) - divida.pagamentos.reduce((acc, p) => acc + Number(p.valor), 0)).toFixed(2)}
    `.trim()
    
    navigator.clipboard.writeText(texto)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Dados copiados!')
  }

  const handleWhatsApp = () => {
    if (!divida) return
    
    const totalPago = divida.pagamentos.reduce((acc, p) => acc + Number(p.valor), 0)
    const restante = Number(divida.valor_original) - totalPago
    
    const mensagem = `Olá, ${divida.devedor.nome}!

Segue resumo da sua dívida:

💰 Valor Total: R$ ${Number(divida.valor_original).toFixed(2)}
✅ Já Pago: R$ ${totalPago.toFixed(2)}
📊 Restante: R$ ${restante.toFixed(2)}

${divida.descricao ? `📝 Descrição: ${divida.descricao}` : ''}

Chave PIX para pagamento: jcsolucoesgo@gmail.com

Aguardo o comprovante!`
    
    const url = `https://wa.me/5562999999999?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!divida) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dívida não encontrada</h1>
          <p className="text-gray-600 mb-6">A dívida que você procura não existe ou foi removida.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const totalPago = divida.pagamentos.reduce((acc, p) => acc + Number(p.valor), 0)
  const restante = Number(divida.valor_original) - totalPago
  const progresso = (totalPago / Number(divida.valor_original)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detalhes da Dívida</h1>
                <p className="text-sm text-gray-500">ID: {divida.id.slice(0, 8)}...</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopiarDados}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="w-5 h-5" />
                Enviar
              </button>
              {!editando ? (
                <button
                  onClick={() => setEditando(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                  Editar
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setEditando(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvar}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    Salvar
                  </button>
                </>
              )}
              <button
                onClick={handleExcluir}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {editando ? (
          <form onSubmit={handleSalvar} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Devedor</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor Original (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor_original}
                  onChange={(e) => setFormData({ ...formData, valor_original: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Vencimento</label>
                <input
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.ativa}
                onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                id="ativa"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="ativa" className="text-sm font-medium text-gray-700">Dívida Ativa</label>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Salvar Alterações
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cards de Valores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">Valor Total</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">R$ {Number(divida.valor_original).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex items-center gap-3 mb-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-600">Já Pago</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">R$ {totalPago.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-gray-600">Restante</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">R$ {restante.toFixed(2)}</p>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Progresso do Pagamento</span>
                  <span className="text-sm font-bold text-blue-600">{progresso.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progresso, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Informações do Devedor */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-6 h-6 text-blue-500" />
                  <h2 className="text-lg font-bold text-gray-900">Informações do Devedor</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="text-base font-medium text-gray-900">{divida.devedor.nome}</p>
                  </div>
                  {divida.devedor.telefone && (
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="text-base font-medium text-gray-900">{divida.devedor.telefone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalhes da Dívida */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-blue-500" />
                  <h2 className="text-lg font-bold text-gray-900">Detalhes da Dívida</h2>
                </div>
                <div className="space-y-4">
                  {divida.descricao && (
                    <div>
                      <p className="text-sm text-gray-500">Descrição</p>
                      <p className="text-base font-medium text-gray-900">{divida.descricao}</p>
                    </div>
                  )}
                  {divida.data_vencimento && (
                    <div>
                      <p className="text-sm text-gray-500">Vencimento</p>
                      <p className="text-base font-medium text-gray-900">
                        {new Date(divida.data_vencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`text-base font-semibold ${divida.ativa ? 'text-green-600' : 'text-gray-600'}`}>
                      {divida.ativa ? '✅ Ativa' : '❌ Inativa'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Pagamentos */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pagamentos</h3>
                {divida.pagamentos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Nenhum pagamento registrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {divida.pagamentos.map((pag) => (
                      <div
                        key={pag.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(pag.data_pagamento).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-gray-500">Pagamento</p>
                        </div>
                        <p className="text-base font-bold text-green-600">
                          R$ {Number(pag.valor).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}