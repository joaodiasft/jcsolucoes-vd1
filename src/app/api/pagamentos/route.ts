import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validarSessao } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await validarSessao()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { divida_id, valor, data_pagamento } = await request.json()

    if (!divida_id || !valor) {
      return NextResponse.json(
        { error: 'divida_id e valor são obrigatórios' },
        { status: 400 }
      )
    }

    const pagamento = await prisma.pagamento.create({
      data: {
        divida_id,
        valor,
        data_pagamento: data_pagamento ? new Date(data_pagamento) : new Date(),
      },
    })

    // Log de auditoria
    await prisma.auditoria.create({
      data: {
        acao: 'CREATE',
        tabela: 'pagamento',
        registro_id: pagamento.id,
        dados_novos: {
          divida_id,
          valor: Number(valor),
          data_pagamento: pagamento.data_pagamento,
        } as any,
        usuario_id: session.usuarioId,
      },
    })

    return NextResponse.json(pagamento, { status: 201 })
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error)
    return NextResponse.json({ error: 'Erro ao registrar pagamento' }, { status: 500 })
  }
}
