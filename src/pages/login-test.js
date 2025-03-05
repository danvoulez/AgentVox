import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function LoginTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Inicializar o cliente Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Verificar o usuário atual ao carregar a página
  useState(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };
    checkUser();
  }, []);

  // Função para fazer login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setMessage('Login realizado com sucesso!');
      setUser(data.user);
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message || 'Ocorreu um erro durante o login');
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setMessage('Logout realizado com sucesso!');
    } catch (err) {
      setError(err.message || 'Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#3ECF8E' }}>Teste de Login com Supabase</h1>
      
      {/* Status da conexão */}
      <div style={{ marginBottom: '20px', padding: '15px', borderRadius: '5px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
        <h2>Status da Conexão</h2>
        <p>
          <strong>URL do Supabase:</strong> {supabaseUrl || 'Não definido'}
        </p>
        <p>
          <strong>Chave Anônima:</strong> {supabaseAnonKey ? 'Definida (oculta)' : 'Não definida'}
        </p>
      </div>
      
      {/* Informações do usuário atual */}
      {user && (
        <div style={{ marginBottom: '20px', padding: '15px', borderRadius: '5px', backgroundColor: '#e6f7ef', border: '1px solid #3ECF8E' }}>
          <h2>Usuário Logado</h2>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <button 
            onClick={handleLogout}
            disabled={loading}
            style={{
              padding: '10px 15px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      )}
      
      {/* Formulário de login */}
      {!user && (
        <form onSubmit={handleLogin} style={{ marginBottom: '20px', padding: '15px', borderRadius: '5px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
          <h2>Login</h2>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '10px 15px',
              backgroundColor: '#3ECF8E',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      )}
      
      {/* Mensagens de sucesso ou erro */}
      {message && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e6f7ef', borderRadius: '4px', color: '#2e7d32' }}>
          {message}
        </div>
      )}
      
      {error && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      {/* Instruções adicionais */}
      <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
        <h2>Instruções</h2>
        <ol>
          <li>Certifique-se de que o Supabase está configurado corretamente com autenticação por email/senha.</li>
          <li>Use um email e senha válidos que estejam registrados no seu projeto Supabase.</li>
          <li>Se ocorrer um erro de "Invalid API key", verifique as variáveis de ambiente no arquivo <code>.env.local</code>.</li>
        </ol>
      </div>
    </div>
  );
}
