import React from 'react';

interface ConfigErrorProps {
  title?: string;
  message: string;
  suggestions?: string[];
}

/**
 * Componente para exibir erros de configuração de forma amigável
 */
const ConfigError: React.FC<ConfigErrorProps> = ({ 
  title = 'Erro de Configuração', 
  message, 
  suggestions = [] 
}) => {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '40px auto',
      padding: '20px',
      backgroundColor: '#FEF2F2',
      borderRadius: '8px',
      borderLeft: '4px solid #DC2626',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{
        color: '#991B1B',
        fontSize: '1.5rem',
        marginTop: 0,
        marginBottom: '16px'
      }}>
        {title}
      </h2>
      
      <p style={{
        color: '#7F1D1D',
        fontSize: '1rem',
        lineHeight: '1.5',
        marginBottom: '16px'
      }}>
        {message}
      </p>
      
      {suggestions.length > 0 && (
        <>
          <h3 style={{
            color: '#991B1B',
            fontSize: '1.1rem',
            marginBottom: '8px'
          }}>
            Sugestões para resolver:
          </h3>
          
          <ul style={{
            color: '#7F1D1D',
            paddingLeft: '20px',
            marginBottom: '16px'
          }}>
            {suggestions.map((suggestion, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>{suggestion}</li>
            ))}
          </ul>
        </>
      )}
      
      <div style={{
        backgroundColor: '#FEE2E2',
        padding: '12px',
        borderRadius: '4px',
        fontSize: '0.9rem',
        color: '#991B1B'
      }}>
        <strong>Nota:</strong> Este erro ocorre apenas durante o desenvolvimento e não será exibido para os usuários finais.
      </div>
    </div>
  );
};

/**
 * Componente específico para erros de configuração do Supabase
 */
export const SupabaseConfigError: React.FC = () => {
  return (
    <ConfigError
      title="Erro de Conexão com Supabase"
      message="Não foi possível conectar ao Supabase. Isso pode ser devido a um problema com as variáveis de ambiente ou com o próprio serviço Supabase."
      suggestions={[
        "Verifique se o arquivo .env.local existe na raiz do projeto",
        "Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão configurados corretamente",
        "Verifique se o projeto Supabase está ativo e acessível",
        "Execute o script ./check-env.sh para diagnosticar problemas de configuração",
        "Para desenvolvimento local sem Supabase, defina NEXT_PUBLIC_USE_SUPABASE_MOCK=true no arquivo .env.local"
      ]}
    />
  );
};

/**
 * Componente específico para erros de DNS do Supabase
 */
export const SupabaseDnsError: React.FC = () => {
  return (
    <ConfigError
      title="Erro de DNS do Supabase"
      message="Não foi possível resolver o nome de domínio do Supabase. Isso pode indicar que o projeto não existe mais ou foi renomeado."
      suggestions={[
        "Verifique se o nome do projeto Supabase está correto no arquivo .env.local",
        "Acesse o painel do Supabase (https://app.supabase.io) e confirme o nome do projeto",
        "Execute o script ./fix-supabase-connection.sh para configurar um projeto de fallback",
        "Para desenvolvimento local sem Supabase, defina NEXT_PUBLIC_USE_SUPABASE_MOCK=true no arquivo .env.local"
      ]}
    />
  );
};

export default ConfigError;
