import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState('Testando conexão...');
  const [error, setError] = useState(null);
  const [envVars, setEnvVars] = useState({
    url: null,
    keyFirstChars: null
  });

  useEffect(() => {
    // Obter variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    setEnvVars({
      url: supabaseUrl || 'Não definida',
      keyFirstChars: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'Não definida'
    });

    async function testConnection() {
      try {
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Variáveis de ambiente não definidas');
        }

        // Criar cliente Supabase
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Testar uma consulta simples
        setStatus('Tentando fazer uma consulta...');
        const { error } = await supabase.from('_test_connection').select('*').limit(1);
        
        if (error) {
          if (error.code === 'PGRST116') {
            // Este erro é esperado se a tabela não existir
            setStatus('Conexão com Supabase estabelecida com sucesso!');
          } else {
            throw error;
          }
        } else {
          setStatus('Conexão com Supabase estabelecida com sucesso!');
        }
      } catch (err) {
        console.error('Erro ao conectar com Supabase:', err);
        setError(err.message);
        setStatus('Falha na conexão');
      }
    }

    testConnection();
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#3ECF8E', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        Teste de Conexão com Supabase
      </h1>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h2>Variáveis de Ambiente</h2>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envVars.url}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {envVars.keyFirstChars}</p>
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: status.includes('sucesso') ? '#e6f7ef' : error ? '#ffebee' : '#fff8e1',
        borderRadius: '5px',
        color: status.includes('sucesso') ? '#2e7d32' : error ? '#c62828' : '#f57c00'
      }}>
        <h2>Status da Conexão</h2>
        <p><strong>{status}</strong></p>
        {error && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
            <h3>Erro:</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h2>Solução de Problemas</h2>
        <ol>
          <li>Verifique se as variáveis de ambiente estão definidas corretamente no arquivo <code>.env.local</code></li>
          <li>Certifique-se de que o URL do Supabase está correto e acessível</li>
          <li>Verifique se a chave anônima do Supabase está correta</li>
          <li>Reinicie o servidor Next.js após fazer alterações no arquivo <code>.env.local</code></li>
        </ol>
      </div>
    </div>
  );
}
