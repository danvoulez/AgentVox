import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/auth/supabase';

export default function DiagnosePage() {
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [envVariables, setEnvVariables] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      try {
        // Verificar variáveis de ambiente
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        setEnvVariables({
          supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'não definida',
          supabaseKey: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'não definida',
          supabaseUrlLength: supabaseUrl?.length || 0,
          supabaseKeyLength: supabaseKey?.length || 0
        });
        
        // Verificar status da API
        const apiResponse = await fetch('/api/supabase-status');
        const apiData = await apiResponse.json();
        setApiStatus(apiData);
        
        // Verificar status da autenticação
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setAuthStatus({
            status: 'error',
            message: error.message,
            code: error.code
          });
        } else {
          setAuthStatus({
            status: 'success',
            session: data.session ? 'Ativa' : 'Inativa',
            user: data.session?.user ? {
              id: data.session.user.id,
              email: data.session.user.email
            } : null
          });
        }
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido durante o diagnóstico');
      } finally {
        setLoading(false);
      }
    }
    
    checkStatus();
  }, []);
  
  const handleTestLogin = () => {
    router.push('/test-login');
  };
  
  const handleGoToLogin = () => {
    router.push('/auth/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Diagnóstico do Sistema | AgentVox</title>
      </Head>
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Diagnóstico do Sistema</h1>
          <p className="mt-2 text-gray-600">Verificação de conexão com Supabase e autenticação</p>
        </div>
        
        {loading ? (
          <div className="text-center p-8">
            <div className="animate-pulse text-gray-600">Carregando diagnóstico...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="text-red-700">
                <span className="font-medium">Erro no diagnóstico:</span> {error}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Variáveis de ambiente */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Variáveis de Ambiente</h2>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">NEXT_PUBLIC_SUPABASE_URL</dt>
                    <dd className="mt-1 text-sm text-gray-900">{envVariables?.supabaseUrl || 'Não disponível'}</dd>
                    <dd className="mt-1 text-xs text-gray-500">Comprimento: {envVariables?.supabaseUrlLength || 0}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">NEXT_PUBLIC_SUPABASE_ANON_KEY</dt>
                    <dd className="mt-1 text-sm text-gray-900">{envVariables?.supabaseKey || 'Não disponível'}</dd>
                    <dd className="mt-1 text-xs text-gray-500">Comprimento: {envVariables?.supabaseKeyLength || 0}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Status da API */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Status da API</h2>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className={`rounded-md p-4 ${apiStatus?.status === 'success' ? 'bg-green-50' : apiStatus?.status === 'partial_success' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                  <div className="flex">
                    <div className={`${apiStatus?.status === 'success' ? 'text-green-700' : apiStatus?.status === 'partial_success' ? 'text-yellow-700' : 'text-red-700'}`}>
                      <span className="font-medium">Status:</span> {apiStatus?.status || 'Desconhecido'}
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>{apiStatus?.message || apiStatus?.error || 'Sem informações adicionais'}</p>
                  </div>
                  {apiStatus?.details && (
                    <div className="mt-2 text-xs">
                      <pre className="p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(apiStatus.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Status da Autenticação */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Status da Autenticação</h2>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className={`rounded-md p-4 ${authStatus?.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex">
                    <div className={`${authStatus?.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                      <span className="font-medium">Status:</span> {authStatus?.status || 'Desconhecido'}
                    </div>
                  </div>
                  {authStatus?.status === 'success' && (
                    <div className="mt-2 text-sm">
                      <p>Sessão: {authStatus.session}</p>
                      {authStatus.user && (
                        <div className="mt-1">
                          <p>Usuário: {authStatus.user.email}</p>
                          <p className="text-xs text-gray-500">ID: {authStatus.user.id}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {authStatus?.status === 'error' && (
                    <div className="mt-2 text-sm">
                      <p>{authStatus.message}</p>
                      {authStatus.code && <p className="text-xs text-gray-500">Código: {authStatus.code}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Ações */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <button
                onClick={handleTestLogin}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Testar Login
              </button>
              <button
                onClick={handleGoToLogin}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Ir para Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Atualizar Diagnóstico
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
