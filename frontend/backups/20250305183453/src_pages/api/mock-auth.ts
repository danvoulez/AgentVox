import { NextApiRequest, NextApiResponse } from 'next';

// Tipos para a resposta da API
interface SuccessResponse {
  user: {
    id: string;
    email: string;
    role?: string;
  };
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  message?: string;
}

interface ErrorResponse {
  error: string;
  code?: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

// Usuários mockados para desenvolvimento
const mockUsers = [
  { id: 'user-1', email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { id: 'user-2', email: 'user@example.com', password: 'user123', role: 'user' },
  { id: 'user-3', email: 'test@example.com', password: 'test123', role: 'user' }
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Simular um pequeno atraso para parecer mais realista
  setTimeout(() => {
    // Apenas aceitar requisições POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }
    
    const { action, email, password } = req.body;
    
    // Verificar se a ação foi especificada
    if (!action) {
      return res.status(400).json({ error: 'Ação não especificada' });
    }
    
    // Processar diferentes ações de autenticação
    switch (action) {
      case 'signin':
        return handleSignIn(req, res, email, password);
        
      case 'signup':
        return handleSignUp(req, res, email, password);
        
      case 'signout':
        return handleSignOut(req, res);
        
      case 'reset-password':
        return handleResetPassword(req, res, email);
        
      default:
        return res.status(400).json({ error: 'Ação inválida' });
    }
  }, 500); // 500ms de atraso
}

// Função para lidar com login
function handleSignIn(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  email?: string,
  password?: string
) {
  // Verificar se email e senha foram fornecidos
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  // Procurar o usuário
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas', code: 'invalid_credentials' });
  }
  
  // Criar uma sessão mockada
  const session = {
    access_token: `mock-token-${user.id}-${Date.now()}`,
    refresh_token: `mock-refresh-${user.id}-${Date.now()}`,
    expires_at: Date.now() + 3600000 // 1 hora
  };
  
  // Retornar o usuário e a sessão
  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    },
    session,
    message: 'Login realizado com sucesso'
  });
}

// Função para lidar com cadastro
function handleSignUp(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  email?: string,
  password?: string
) {
  // Verificar se email e senha foram fornecidos
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  // Verificar se o email já está em uso
  if (mockUsers.some(u => u.email === email)) {
    return res.status(400).json({ error: 'Email já está em uso', code: 'email_in_use' });
  }
  
  // Criar um novo usuário
  const newUser = {
    id: `user-${mockUsers.length + 1}`,
    email,
    password,
    role: 'user'
  };
  
  // Adicionar o usuário à lista (em um cenário real, isso seria salvo em um banco de dados)
  mockUsers.push(newUser);
  
  // Retornar o usuário criado (sem sessão para simular confirmação de email)
  return res.status(200).json({
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    },
    message: 'Conta criada com sucesso. Verifique seu email para confirmar o cadastro.'
  });
}

// Função para lidar com logout
function handleSignOut(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Em um cenário real, invalidaríamos o token
  return res.status(200).json({
    user: { id: '', email: '' },
    message: 'Logout realizado com sucesso'
  });
}

// Função para lidar com recuperação de senha
function handleResetPassword(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  email?: string
) {
  // Verificar se o email foi fornecido
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }
  
  // Verificar se o email existe
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    // Por segurança, não informamos se o email existe ou não
    return res.status(200).json({
      user: { id: '', email: '' },
      message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
    });
  }
  
  // Em um cenário real, enviaríamos um email com instruções
  return res.status(200).json({
    user: { id: '', email: '' },
    message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
  });
}
