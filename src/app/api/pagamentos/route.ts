import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
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

    return NextResponse.json(pagamento, { status: 201 })
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error)
    return NextResponse.json({ error: 'Erro ao registrar pagamento' }, { status: 500 })
  }
}
