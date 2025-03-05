import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api/auth',
];

// Rotas administrativas que precisam de permissão de admin
const adminRoutes = [
  '/admin',
  '/settings',
];

// Verificar se a rota atual é pública
const isPublicRoute = (path: string) => {
  return publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
};

// Verificar se a rota atual é administrativa
const isAdminRoute = (path: string) => {
  return adminRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
};

export async function middleware(req: NextRequest) {
  // Cria um cliente do Supabase para uso no middleware
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Verificar se o usuário está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;
  
  // Permitir acesso a rotas públicas
  if (isPublicRoute(path)) {
    return res;
  }
  
  // Redirecionar para login se não estiver autenticado
  if (!session) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Verificar permissões para rotas administrativas
  if (isAdminRoute(path)) {
    // Buscar o papel do usuário
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    
    // Verificar se o usuário é admin
    const isAdmin = data?.role === 'admin';
    
    // Redirecionar para página inicial se não for admin
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  return res;
}

// Configurar em quais caminhos o middleware será executado
export const config = {
  matcher: [
    // Aplicar a todas as rotas exceto arquivos estáticos e api
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
