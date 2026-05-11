import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verificarSenha, criarTokenSessao } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Normaliza email
    const emailNormalizado = email.toLowerCase().trim()

    // Busca usuário no banco (otimizado)
    const usuario = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
      select: {
        id: true,
        senha_hash: true,
      },
    })

    if (!usuario) {
      // Delay para evitar timing attacks
      await new Promise(resolve => setTimeout(resolve, 100))
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      )
    }

    // Verifica senha (bcrypt é rápido para comparação)
    const senhaValida = await verificarSenha(senha, usuario.senha_hash)

    if (!senhaValida) {
      await new Promise(resolve => setTimeout(resolve, 100))
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      )
    }

    // Cria token de sessão (rápido)
    const token = await criarTokenSessao(usuario.id)

    // Cria response com cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lucky',
      maxAge: 604800, // 7 dias em segundos
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
