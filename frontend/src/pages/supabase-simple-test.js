import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function SupabaseSimpleTest() {
  const [status, setStatus] = useState('Carregando...');
  const [error, setError] = useState(null);
  const [envVars, setEnvVars] = useState({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não definido',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Definido (oculto)' : 'Não definido'
  });

  useEffect(() => {
    async function testSupabase() {
      try {
        // Verificar se as variáveis de ambiente estão definidas
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Variáveis de ambiente não definidas');
        }

        // Criar cliente Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Testar conexão com o Supabase
        const { data, error } = await supabase.from('_test_connection').select('*').limit(1).maybeSingle();
        
        if (error) {
          if (error.code === 'PGRST116') {
            // Este erro é esperado se a tabela não existir, mas indica que a conexão está funcionando
            setStatus('Conexão com Supabase estabelecida com sucesso! (Tabela _test_connection não existe, mas isso é esperado)');
          } else {
            throw error;
          }
        } else {
          setStatus('Conexão com Supabase estabelecida com sucesso!');
        }
      } catch (err) {
        console.error('Erro ao testar Supabase:', err);
        setError(err.message || 'Erro desconhecido');
        setStatus('Falha na conexão com Supabase');
      }
    }

    testSupabase();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#3ECF8E' }}>Teste Simples do Supabase</h1>
      
      <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
        <h2>Status da Conexão</h2>
        <p style={{ 
          padding: '10px', 
          borderRadius: '4px', 
          backgroundColor: status.includes('sucesso') ? '#e6f7ef' : (error ? '#ffebee' : '#fff8e1'),
          color: status.includes('sucesso') ? '#2e7d32' : (error ? '#c62828' : '#f57c00')
        }}>
          <strong>{status}</strong>
        </p>
        
        {error && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
            <h3>Erro:</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
        <h2>Variáveis de Ambiente</h2>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envVars.url}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {envVars.anonKey}</p>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
        <h2>Próximos Passos</h2>
        <ol>
          <li>Se a conexão falhar, verifique se as variáveis de ambiente estão configuradas corretamente no arquivo <code>.env.local</code></li>
          <li>Certifique-se de que o servidor Supabase está acessível e funcionando</li>
          <li>Verifique se as credenciais do Supabase estão corretas</li>
        </ol>
      </div>
    </div>
  );
}
