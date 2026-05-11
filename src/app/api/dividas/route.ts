import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const dividas = await prisma.divida.findMany({
      include: {
        devedor: true,
        pagamentos: true,
      },
      orderBy: { criado_em: 'desc' },
    })

    const dividasComSaldo = dividas.map((divida) => {
      const totalPago = divida.pagamentos.reduce(
        (acc, pag) => acc + Number(pag.valor),
        0
      )
      return {
        ...divida,
        valor_original: Number(divida.valor_original),
        total_pago: totalPago,
        saldo_devedor: Number(divida.valor_original) - totalPago,
      }
    })

    return NextResponse.json(dividasComSaldo)
  } catch (error) {
    console.error('Erro ao buscar dívidas:', error)
    return NextResponse.json({ error: 'Erro ao buscar dívidas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { devedor_id, valor_original, descricao, data_vencimento } = body

    const divida = await prisma.divida.create({
      data: {
        devedor_id,
        valor_original,
        descricao: descricao || null,
        data_vencimento: data_vencimento ? new Date(data_vencimento) : null,
      },
      include: { devedor: true },
    })

    return NextResponse.json(divida, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar dívida:', error)
    return NextResponse.json({ error: 'Erro ao criar dívida' }, { status: 500 })
  }
}
