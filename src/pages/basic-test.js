// Página de teste básico para verificar se o Next.js está compilando corretamente

export default function BasicTest() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Teste Básico</h1>
      <p>Se você está vendo esta página, o Next.js está compilando corretamente.</p>
      
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Variáveis de Ambiente</h2>
        <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não definida'}</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Definida' : 'Não definida'}</p>
      </div>
    </div>
  );
}
