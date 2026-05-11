import { hash, compare } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'default-secret-key-change-in-production'
)

export async function hashSenha(senha: string): Promise<string> {
  return hash(senha, 10)
}

export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return compare(senha, hash)
}

export async function criarTokenSessao(usuarioId: string): Promise<string> {
  const token = await new SignJWT({ usuarioId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  
  return token
}

export async function validarTokenSessao(token: string): Promise<{ usuarioId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return { usuarioId: payload.usuarioId as string }
  } catch (error) {
    return null
  }
}
