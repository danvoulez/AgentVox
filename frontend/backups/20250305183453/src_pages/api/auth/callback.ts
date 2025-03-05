import { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/utils/supabase/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Cria o cliente do Supabase no servidor
    const supabase = createSupabaseServerClient();
    
    // Processa o callback OAuth
    const { code } = req.query;
    
    if (!code) {
      console.error('Código de autorização ausente no callback');
      return res.redirect('/auth/login?error=Código de autorização ausente');
    }
    
    console.log('Recebido código de autorização, trocando por sessão...');
    
    // Troca o código de autorização por uma sessão
    const { data, error } = await supabase.auth.exchangeCodeForSession(code as string);
    
    if (error) {
      console.error('Erro ao trocar código por sessão:', error.message);
      return res.redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    }
    
    console.log('Sessão obtida com sucesso, redirecionando para dashboard...');
    
    // Configurar cookie de sessão
    if (data?.session) {
      // O Supabase já configura o cookie automaticamente, mas podemos registrar o sucesso
      console.log('Sessão configurada para usuário:', data.session.user.email);
    }
    
    // Redireciona para a dashboard após login bem-sucedido
    return res.redirect('/dashboard');
  } catch (error: any) {
    console.error('Erro no callback de autenticação:', error);
    const errorMessage = error.message || 'Falha na autenticação externa';
    return res.redirect(`/auth/login?error=${encodeURIComponent(errorMessage)}`);
  }
}
