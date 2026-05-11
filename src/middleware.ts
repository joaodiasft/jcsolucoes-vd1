import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const isLoginPath = request.nextUrl.pathname === '/login'
  const isAdminPath = request.nextUrl.pathname.startsWith('/dashboard')
  const isApiAdmin = request.nextUrl.pathname.startsWith('/api/dividas') ||
                     request.nextUrl.pathname.startsWith('/api/pagamentos') ||
                     request.nextUrl.pathname.startsWith('/api/devedores')

  // Verifica se é uma rota protegida
  if (isAdminPath || isApiAdmin) {
    if (!session) {
      // Redireciona para login se não tiver sessão
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Se já está logado e tenta acessar login, redireciona para dashboard
  if (isLoginPath && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/dividas/:path*', '/api/pagamentos/:path*', '/api/devedores/:path*', '/login'],
}
