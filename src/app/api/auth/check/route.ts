import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validarTokenSessao } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value

    if (!session) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    const payload = await validarTokenSessao(session)

    if (!payload) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    return NextResponse.json({ valid: true, usuarioId: payload.usuarioId })
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }
}
