import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSecureToken, hashToken, getExpiryDate } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const { devedor_id } = await request.json()

    if (!devedor_id) {
      return NextResponse.json({ error: 'devedor_id é obrigatório' }, { status: 400 })
    }

    const token = generateSecureToken()
    const tokenHash = hashToken(token)
    const expiraEm = getExpiryDate(24)

    await prisma.tokenAcesso.create({
      data: {
        devedor_id,
        token_hash: tokenHash,
        expira_em: expiraEm,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const linkAcesso = `${appUrl}/c/${token}`

    return NextResponse.json({
      token,
      link: linkAcesso,
      expira_em: expiraEm,
    })
  } catch (error) {
    console.error('Erro ao gerar token:', error)
    return NextResponse.json({ error: 'Erro ao gerar token' }, { status: 500 })
  }
}
