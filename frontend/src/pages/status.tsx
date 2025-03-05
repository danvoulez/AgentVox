import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

export default function StatusPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<any>({
    connected: false,
    responseTime: null,
    error: null
  });
  const [envVariables, setEnvVariables] = useState<any>({
    supabaseUrl: {
      value: '',
      masked: '',
      exists: false
    },
    supabaseAnonKey: {
      value: '',
      masked: '',
      exists: false
    },
    nodeEnv: '',
    buildTime: '',
    vercelEnv: ''
  });

  useEffect(() => {
    // Capturar o momento de build
    const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();
    
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const nodeEnv = process.env.NODE_ENV || 'development';
    const vercelEnv = process.env.VERCEL_ENV || 'local';
    
    setEnvVariables({
      supabaseUrl: {
        value: supabaseUrl,
        masked: supabaseUrl ? `${supabaseUrl.substring(0, 12)}...` : 'não definida',
        exists: !!supabaseUrl
      },
      supabaseAnonKey: {
        value: supabaseAnonKey,
        masked: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 5)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 5)}` : 'não definida',
        exists: !!supabaseAnonKey
      },
      nodeEnv,
      buildTime,
      vercelEnv
    });
    
    // Testar conexão com Supabase
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      setLoading(true);
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Variáveis de ambiente do Supabase não configuradas');
      }
      
      const startTime = Date.now();
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Testar uma operação simples
      const { data, error } = await Promise.race([
        supabase.from('_test_connection').select('*').limit(1),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao conectar com Supabase')), 5000)
        )
      ]);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (error) {
        throw error;
      }
      
      setSupabaseStatus({
        connected: true,
        responseTime: `${responseTime}ms`,
        error: null
      });
    } catch (err: any) {
      setSupabaseStatus({
        connected: false,
        responseTime: null,
        error: err.message || 'Erro desconhecido'
      });
      setError(err.message || 'Erro desconhecido ao conectar com Supabase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Status do Sistema | AgentVox</title>
      </Head>
      
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-blue-600 text-white">
          <h1 className="text-2xl font-bold">Status do Sistema</h1>
          <p className="text-blue-100">
            Página de diagnóstico para verificar a configuração do ambiente
          </p>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Informações do Ambiente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-700">Ambiente</h3>
                <p className="mt-1 text-gray-600">{envVariables.nodeEnv}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-700">Ambiente Vercel</h3>
                <p className="mt-1 text-gray-600">{envVariables.vercelEnv}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-700">Momento do Build</h3>
                <p className="mt-1 text-gray-600">{envVariables.buildTime}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-700">URL do Supabase</h3>
                <p className={`mt-1 ${envVariables.supabaseUrl.exists ? 'text-green-600' : 'text-red-600'}`}>
                  {envVariables.supabaseUrl.masked}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-700">Chave Anônima do Supabase</h3>
                <p className={`mt-1 ${envVariables.supabaseAnonKey.exists ? 'text-green-600' : 'text-red-600'}`}>
                  {envVariables.supabaseAnonKey.masked}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Status da Conexão com Supabase</h2>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Testando conexão...</span>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full ${supabaseStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <h3 className="font-medium text-gray-700 ml-2">
                    Status: {supabaseStatus.connected ? 'Conectado' : 'Desconectado'}
                  </h3>
                </div>
                {supabaseStatus.connected && (
                  <p className="mt-2 text-gray-600">
                    Tempo de resposta: {supabaseStatus.responseTime}
                  </p>
                )}
                {supabaseStatus.error && (
                  <p className="mt-2 text-red-600">
                    Erro: {supabaseStatus.error}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-6">
            <button
              onClick={() => testSupabaseConnection()}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Testando...' : 'Testar Conexão Novamente'}
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-100 border-t">
          <p className="text-sm text-gray-600">
            Esta página é usada para diagnóstico e não deve ser acessível publicamente em produção.
          </p>
        </div>
      </div>
    </div>
  );
}
