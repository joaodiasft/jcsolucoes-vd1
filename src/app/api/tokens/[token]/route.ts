import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashToken } from '@/lib/security'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const token = url.pathname.split('/').pop()

    if (!token) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    }

    const tokenHash = hashToken(token)

    const tokenAcesso = await prisma.tokenAcesso.findUnique({
      where: { token_hash: tokenHash },
      include: {
        devedor: {
          include: {
            dividas: {
              include: {
                pagamentos: true,
              },
            },
          },
        },
      },
    })

    if (!tokenAcesso) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
    }

    if (tokenAcesso.usado) {
      return NextResponse.json({ error: 'Token já utilizado' }, { status: 400 })
    }

    if (new Date(tokenAcesso.expira_em) < new Date()) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 })
    }

    const divida = tokenAcesso.devedor.dividas[0]
    if (!divida) {
      return NextResponse.json({ error: 'Nenhuma dívida encontrada' }, { status: 404 })
    }

    const totalPago = divida.pagamentos.reduce(
      (acc, pag) => acc + Number(pag.valor),
      0
    )

    return NextResponse.json({
      divida: {
        id: divida.id,
        valor_original: Number(divida.valor_original),
        descricao: divida.descricao,
      },
      devedor: {
        nome: tokenAcesso.devedor.nome,
      },
      total_pago: totalPago,
      saldo_devedor: Number(divida.valor_original) - totalPago,
      pagamentos: divida.pagamentos.map((pag) => ({
        id: pag.id,
        valor: Number(pag.valor),
        data_pagamento: pag.data_pagamento,
      })),
    })
  } catch (error) {
    console.error('Erro ao validar token:', error)
    return NextResponse.json({ error: 'Erro ao validar token' }, { status: 500 })
  }
}