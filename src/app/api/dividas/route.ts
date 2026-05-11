import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validarSessao } from '@/lib/auth'

export async function GET() {
  try {
    const session = await validarSessao()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

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
    const session = await validarSessao()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { devedor_id, valor_original, descricao, data_vencimento } = body

    const divida = await prisma.divida.create({
      data: {
        devedor_id,
        valor_original,
        descricao: descricao || null,
        data_vencimento: data_vencimento ? new Date(data_vencimento) : null,
        criado_por: session.usuarioId,
      },
      include: { devedor: true },
    })

    // Log de auditoria
    await prisma.auditoria.create({
      data: {
        acao: 'CREATE',
        tabela: 'divida',
        registro_id: divida.id,
        dados_novos: {
          divida: { ...divida, valor_original: Number(divida.valor_original) },
          devedor_id,
        } as any,
        usuario_id: session.usuarioId,
      },
    })

    return NextResponse.json(divida, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar dívida:', error)
    return NextResponse.json({ error: 'Erro ao criar dívida' }, { status: 500 })
  }
}
