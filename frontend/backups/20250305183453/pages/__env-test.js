
export default function EnvTest() {
  return (
    <div>
      <h1>Teste de Variáveis de Ambiente</h1>
      <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não definida'}</p>
      <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Definida (oculta)' : 'Não definida'}</p>
    </div>
  );
}
  