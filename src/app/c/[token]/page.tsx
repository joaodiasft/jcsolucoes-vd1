"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface DividaData {
  divida: {
    id: string
    valor_original: number
    descricao?: string
  }
  devedor: {
    nome: string
  }
  total_pago: number
  saldo_devedor: number
  pagamentos: Array<{
    id: string
    valor: number
    data_pagamento: string
  }>
}

export default function DevedorPage() {
  const params = useParams()
  const token = params?.token as string
  const [data, setData] = useState<DividaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [pagamentoData, setPagamentoData] = useState('')
  const [pagamentoValor, setPagamentoValor] = useState('')

  useEffect(() => {
    if (!token) return

    fetch(`/api/tokens/${token}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.error) {
          setError(result.error)
        } else {
          setData(result)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Erro ao carregar dados')
        setLoading(false)
      })
  }, [token])

  const handleCopiarPix = () => {
    const chavePix = 'jcsolucoesgo@gmail.com'
    navigator.clipboard.writeText(chavePix)
    alert('Chave PIX copiada!')
  }

  const handleWhatsApp = () => {
    const mensagem = `Olá! Sou ${data?.devedor.nome}. Segue meu comprovante de pagamento.`
    const url = `https://wa.me/5562999999999?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
  }

  const handleConfirmarPagamento = () => {
    setShowModal(true)
  }

  const handleEnviarConfirmacao = () => {
    if (!pagamentoData || !pagamentoValor || !data) {
      alert('Preencha todos os campos')
      return
    }

    const dataFormatada = new Date(pagamentoData).toLocaleDateString('pt-BR')
    const valorFormatado = Number(pagamentoValor).toFixed(2)
    
    const mensagem = `Olá, sou ${data.devedor.nome}.\\n\\nConfirmo o pagamento de R$ ${valorFormatada} realizado em ${dataFormatada}.\\nReferente à dívida: ${data.divida.descricao || data.divida.id}\\n\\nSeguem meus dados:\\n- Nome: ${data.devedor.nome}\\n\\nEm anexo, envio o comprovante.`
    
    const url = `https://wa.me/5562999999999?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
    setShowModal(false)
    setPagamentoData('')
    setPagamentoValor('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Link inválido ou expirado</p>
          <p className="text-gray-600 mt-2">{error || 'Entre em contato com o administrador'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {data.devedor.nome}!
          </h1>
          <p className="text-gray-600 mb-8">
            Confira abaixo o resumo da sua dívida
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-xl font-bold text-gray-900">
                R$ {data.divida.valor_original.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Já Pago</p>
              <p className="text-xl font-bold text-green-600">
                R$ {data.total_pago.toFixed(2)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Restante</p>
              <p className="text-xl font-bold text-red-600">
                R$ {data.saldo_devedor.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <button
              onClick={handleCopiarPix}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Copiar Chave PIX
            </button>
            <button
              onClick={handleConfirmarPagamento}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              Confirmar Pagamento
            </button>
            <button
              onClick={handleWhatsApp}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Enviar Comprovante
            </button>
          </div>

          {data.pagamentos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Histórico de Pagamentos
              </h2>
              <div className="space-y-2">
                {data.pagamentos.map((pagamento) => (
                  <div
                    key={pagamento.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <span className="text-gray-600">
                      {new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="font-semibold text-green-600">
                      R$ {Number(pagamento.valor).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirmar Pagamento</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do Pagamento
                </label>
                <input
                  type="date"
                  value={pagamentoData}
                  onChange={(e) => setPagamentoData(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Pago (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pagamentoValor}
                  onChange={(e) => setPagamentoValor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleEnviarConfirmacao}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
              >
                Enviar Comprovante
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
