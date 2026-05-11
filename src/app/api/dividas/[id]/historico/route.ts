import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validarSessao } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await validarSessao()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const logs = await prisma.auditoria.findMany({
      where: {
        registro_id: params.id,
      },
      include: {
        usuario: true,
      },
      orderBy: {
        criado_em: 'desc',
      },
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 })
  }
}
