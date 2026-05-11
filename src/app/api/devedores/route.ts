import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { nome, telefone } = await request.json()

    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const devedor = await prisma.devedor.create({
      data: {
        nome,
        telefone: telefone || null,
      },
    })

    return NextResponse.json(devedor, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar devedor:', error)
    return NextResponse.json({ error: 'Erro ao criar devedor' }, { status: 500 })
  }
}