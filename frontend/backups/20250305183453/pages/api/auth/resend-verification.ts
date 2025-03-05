import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/utils/supabase/api';

interface ResponseData {
  success?: boolean;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email } = req.body;

    // Validar email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Criar cliente Supabase (lado do servidor)
    const supabase = createSupabaseServerClient();

    // Reenviar email de verificação
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    // Verificar se houve erro
    if (error) {
      console.error('Erro ao reenviar email de verificação:', error);
      return res.status(400).json({ error: error.message });
    }

    // Resposta de sucesso
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
}
