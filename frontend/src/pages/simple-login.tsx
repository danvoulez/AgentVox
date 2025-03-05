import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

export default function SimpleLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [envStatus, setEnvStatus] = useState({
    url: '',
    key: '',
    urlOk: false,
    keyOk: false
  });

  // Inicializar o cliente Supabase diretamente na página
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Criar o cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    // Verificar variáveis de ambiente
    const urlOk = !!supabaseUrl && supabaseUrl.length > 10;
    const keyOk = !!supabaseKey && supabaseKey.length > 20;
    
    setEnvStatus({
      url: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : 'Não definida',
      key: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'Não definida',
      urlOk,
      keyOk
    });
    
    // Verificar se já existe uma sessão
    checkSession();
  }, []);

  // Verificar sessão existente
  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setMessage(`Erro ao verificar sessão: ${error.message}`);
        return;
      }
      
      if (data?.session) {
        setMessage(`Usuário já autenticado: ${data.session.user.email}`);
      } else {
        setMessage('Nenhuma sessão ativa encontrada');
      }
    } catch (err) {
      setMessage(`Erro ao verificar sessão: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Função de login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // Verificar se as variáveis de ambiente estão configuradas
      if (!envStatus.urlOk || !envStatus.keyOk) {
        setMessage('Erro: Variáveis de ambiente do Supabase não configuradas corretamente');
        setLoading(false);
        return;
      }
      
      // Tentar fazer login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setMessage(`Erro de login: ${error.message}`);
      } else if (data?.session) {
        setMessage(`Login bem-sucedido! Usuário: ${data.session.user.email}`);
      } else {
        setMessage('Login realizado, mas nenhuma sessão retornada');
      }
    } catch (err) {
      setMessage(`Erro inesperado: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para testar a conexão com o Supabase
  const testConnection = async () => {
    setLoading(true);
    setMessage('Testando conexão com o Supabase...');
    
    try {
      // Fazer uma operação simples para testar a conexão
      const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      
      if (error) {
        if (error.message.includes('Invalid API key')) {
          setMessage('Erro: Chave de API inválida. Verifique as variáveis de ambiente.');
        } else {
          setMessage(`Erro ao testar conexão: ${error.message}`);
        }
      } else {
        setMessage('Conexão com o Supabase estabelecida com sucesso!');
      }
    } catch (err) {
      setMessage(`Erro ao testar conexão: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Login Simplificado - AgentVox</title>
      </Head>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login Simplificado
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Página para diagnóstico e teste de login com Supabase
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Status das variáveis de ambiente */}
          <div className="mb-6 p-4 border rounded bg-gray-50">
            <h3 className="font-medium text-gray-900">Status das Variáveis de Ambiente</h3>
            <div className="mt-2 text-sm">
              <p className="flex justify-between">
                <span>NEXT_PUBLIC_SUPABASE_URL:</span> 
                <span className={envStatus.urlOk ? 'text-green-600' : 'text-red-600'}>
                  {envStatus.url}
                </span>
              </p>
              <p className="flex justify-between">
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span> 
                <span className={envStatus.keyOk ? 'text-green-600' : 'text-red-600'}>
                  {envStatus.key}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={testConnection}
              disabled={loading}
              className="mt-3 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Testar Conexão com Supabase
            </button>
          </div>
          
          {/* Mensagem de status */}
          {message && (
            <div className={`mb-4 p-3 rounded text-sm ${message.includes('sucesso') || message.includes('autenticado') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}
          
          {/* Formulário de login */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
