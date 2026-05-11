import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const divida = await prisma.divida.findUnique({
      where: { id: params.id },
      include: {
        devedor: true,
        pagamentos: true,
      },
    })

    if (!divida) {
      return NextResponse.json({ error: 'Dívida não encontrada' }, { status: 404 })
    }

    return NextResponse.json(divida)
  } catch (error) {
    console.error('Erro ao buscar dívida:', error)
    return NextResponse.json({ error: 'Erro ao buscar dívida' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nome, telefone, valor_original, descricao, data_vencimento, ativa } = body

    // Atualiza devedor
    const dividaAtual = await prisma.divida.findUnique({
      where: { id: params.id },
      include: { devedor: true },
    })

    if (!dividaAtual) {
      return NextResponse.json({ error: 'Dívida não encontrada' }, { status: 404 })
    }

    await prisma.devedor.update({
      where: { id: dividaAtual.devedor_id },
      data: {
        nome,
        telefone: telefone || undefined,
      },
    })

    // Atualiza dívida
    const divida = await prisma.divida.update({
      where: { id: params.id },
      data: {
        valor_original: parseFloat(valor_original),
        descricao: descricao || null,
        data_vencimento: data_vencimento ? new Date(data_vencimento) : null,
        ativa,
      },
      include: { devedor: true },
    })

    return NextResponse.json(divida)
  } catch (error) {
    console.error('Erro ao atualizar dívida:', error)
    return NextResponse.json({ error: 'Erro ao atualizar dívida' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.divida.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir dívida:', error)
    return NextResponse.json({ error: 'Erro ao excluir dívida' }, { status: 500 })
  }
}
