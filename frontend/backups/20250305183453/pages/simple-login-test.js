import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function SimpleLoginTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [envStatus, setEnvStatus] = useState({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Definido ✓' : 'Não definido ✗',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Definido ✓' : 'Não definido ✗',
  });

  // Inicializa o cliente Supabase diretamente na página
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Função para verificar o status atual do usuário
  const checkCurrentUser = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        setUser(data.user);
        setMessage('Usuário já está logado!');
      } else {
        setUser(null);
        setMessage('Nenhum usuário logado.');
      }
    } catch (err) {
      console.error('Erro ao verificar usuário:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage(null);
      setError(null);
      
      // Verifica se as variáveis de ambiente estão definidas
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Variáveis de ambiente do Supabase não estão configuradas corretamente.');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      setUser(data.user);
      setMessage('Login realizado com sucesso!');
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      setMessage('Logout realizado com sucesso!');
    } catch (err) {
      console.error('Erro no logout:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#3ECF8E', textAlign: 'center' }}>Teste de Login Simples</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #ddd' }}>
        <h2>Status das Variáveis de Ambiente</h2>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envStatus.url}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {envStatus.key}</p>
      </div>
      
      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          backgroundColor: '#e6f7ef', 
          color: '#2e7d32', 
          borderRadius: '5px' 
        }}>
          {message}
        </div>
      )}
      
      {error && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '5px' 
        }}>
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      {user ? (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #ddd' }}>
          <h2>Usuário Logado</h2>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Último Login:</strong> {new Date(user.last_sign_in_at).toLocaleString()}</p>
          
          <button 
            onClick={handleLogout}
            disabled={loading}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '10px',
              width: '100%'
            }}
          >
            {loading ? 'Processando...' : 'Fazer Logout'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#3ECF8E',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              width: '100%'
            }}
          >
            {loading ? 'Processando...' : 'Fazer Login'}
          </button>
        </form>
      )}
      
      <button 
        onClick={checkCurrentUser}
        disabled={loading}
        style={{
          backgroundColor: '#2196f3',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          width: '100%',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Verificando...' : 'Verificar Usuário Atual'}
      </button>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #ddd' }}>
        <h2>Instruções</h2>
        <ol style={{ paddingLeft: '20px' }}>
          <li>Verifique se as variáveis de ambiente estão configuradas corretamente</li>
          <li>Use um email e senha válidos para testar o login</li>
          <li>Clique em "Verificar Usuário Atual" para verificar se já existe uma sessão ativa</li>
          <li>Se ocorrer algum erro, verifique o console do navegador para mais detalhes</li>
        </ol>
      </div>
    </div>
  );
}
