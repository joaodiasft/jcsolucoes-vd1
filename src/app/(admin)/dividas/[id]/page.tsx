"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'

interface Divida {
  id: string
  devedor: { id: string; nome: string; telefone?: string }
  valor_original: number
  descricao?: string
  data_vencimento?: string
  ativa: boolean
  pagamentos: Array<{
    id: string
    valor: number
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

  useEffect(() => {
    const id = params.id as string
    if (id) {
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
  }, [params.id])

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
        window.location.reload()
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!divida) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Dívida não encontrada</h1>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster />
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Detalhes da Dívida
          </h1>
          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Voltar
            </Link>
            {!editando ? (
              <button
                onClick={() => setEditando(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Editar
              </button>
            ) : (
              <button
                onClick={() => setEditando(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleExcluir}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Excluir
            </button>
          </div>
        </div>

        {editando ? (
          <form onSubmit={handleSalvar} className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Devedor</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor Original (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.valor_original}
                onChange={(e) => setFormData({ ...formData, valor_original: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Vencimento</label>
              <input
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.ativa}
                onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                id="ativa"
              />
              <label htmlFor="ativa" className="text-sm font-medium text-gray-700">Dívida Ativa</label>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
            >
              Salvar Alterações
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Devedor</h3>
              <p className="text-lg text-gray-900">{divida.devedor.nome}</p>
              {divida.devedor.telefone && <p className="text-gray-600">{divida.devedor.telefone}</p>}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Valor Original</h3>
              <p className="text-lg text-gray-900">R$ {Number(divida.valor_original).toFixed(2)}</p>
            </div>
            {divida.descricao && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
                <p className="text-gray-900">{divida.descricao}</p>
              </div>
            )}
            {divida.data_vencimento && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Vencimento</h3>
                <p className="text-gray-900">{new Date(divida.data_vencimento).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className={`text-lg ${divida.ativa ? 'text-green-600' : 'text-gray-600'}`}>
                {divida.ativa ? 'Ativa' : 'Inativa'}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pagamentos</h2>
          {divida.pagamentos.length === 0 ? (
            <p className="text-gray-500">Nenhum pagamento registrado.</p>
          ) : (
            <div className="space-y-2">
              {divida.pagamentos.map((pag) => (
                <div key={pag.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">
                    {new Date(pag.data_pagamento).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="font-semibold text-green-600">
                    R$ {Number(pag.valor).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
