import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validarSessao } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await validarSessao()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { valor, data_pagamento } = body

    const pagamento = await prisma.pagamento.update({
      where: { id: params.id },
      data: {
        valor,
        data_pagamento: data_pagamento ? new Date(data_pagamento) : undefined,
      },
    })

    // Log de auditoria
    await prisma.auditoria.create({
      data: {
        acao: 'UPDATE',
        tabela: 'pagamento',
        registro_id: params.id,
        dados_novos: { valor: Number(pagamento.valor), data_pagamento: pagamento.data_pagamento } as any,
        usuario_id: session.usuarioId,
      },
    })

    return NextResponse.json(pagamento)
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error)
    return NextResponse.json({ error: 'Erro ao atualizar pagamento' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await validarSessao()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const pagamento = await prisma.pagamento.findUnique({
      where: { id: params.id },
    })

    if (!pagamento) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Log de auditoria
    await prisma.auditoria.create({
      data: {
        acao: 'DELETE',
        tabela: 'pagamento',
        registro_id: params.id,
        dados_anteriores: {
          ...pagamento,
          valor: Number(pagamento.valor),
        } as any,
        usuario_id: session.usuarioId,
      },
    })

    await prisma.pagamento.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir pagamento:', error)
    return NextResponse.json({ error: 'Erro ao excluir pagamento' }, { status: 500 })
  }
}
