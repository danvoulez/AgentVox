// Página de teste para verificar a conexão com o Supabase
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function SupabaseTest() {
  const [status, setStatus] = useState('Verificando...');
  const [envVars, setEnvVars] = useState({
    url: '',
    keyLength: 0
  });
  
  useEffect(() => {
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    setEnvVars({
      url: supabaseUrl,
      keyLength: supabaseKey.length
    });
    
    // Testar conexão
    const testConnection = async () => {
      try {
        if (!supabaseUrl || !supabaseKey) {
          setStatus('Erro: Variáveis de ambiente não configuradas');
          return;
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        
        if (error) {
          setStatus(`Erro de conexão: ${error.message}`);
        } else {
          setStatus('Conexão estabelecida com sucesso!');
        }
      } catch (err) {
        setStatus(`Erro: ${err.message}`);
      }
    };
    
    testConnection();
  }, []);
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Teste de Conexão com Supabase</h1>
      
      <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '20px' }}>
        <h2>Status da Conexão</h2>
        <p style={{ 
          padding: '10px', 
          backgroundColor: status.includes('sucesso') ? '#d4edda' : '#f8d7da',
          color: status.includes('sucesso') ? '#155724' : '#721c24',
          borderRadius: '3px'
        }}>
          {status}
        </p>
      </div>
      
      <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Variáveis de Ambiente</h2>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envVars.url || 'Não definida'}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {envVars.keyLength > 0 ? `Definida (comprimento: ${envVars.keyLength})` : 'Não definida'}</p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Próximos Passos</h2>
        <ol>
          <li>Se a conexão foi estabelecida com sucesso, tente fazer login em <a href="/auth/login">/auth/login</a></li>
          <li>Se ainda houver problemas, verifique se o projeto Supabase está ativo e acessível</li>
          <li>Verifique se as credenciais não expiraram</li>
        </ol>
      </div>
    </div>
  );
}
