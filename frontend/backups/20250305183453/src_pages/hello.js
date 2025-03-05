// Página de teste extremamente simples

export default function Hello() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Hello World!</h1>
      <p>Esta é uma página de teste extremamente simples.</p>
      
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Variáveis de Ambiente</h2>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não definida'}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Definida (comprimento: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'Não definida'}</p>
      </div>
    </div>
  );
}
