// Endpoint para verificar as variáveis de ambiente
export default function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  res.status(200).json({
    supabaseUrlConfigured: !!supabaseUrl,
    supabaseKeyConfigured: !!supabaseKey,
    supabaseUrlLength: supabaseUrl ? supabaseUrl.length : 0,
    supabaseKeyLength: supabaseKey ? supabaseKey.length : 0,
    supabaseUrlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'não definida',
    supabaseKeyPreview: supabaseKey ? `${supabaseKey.substring(0, 10)}...${supabaseKey.substring(supabaseKey.length - 5)}` : 'não definida',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
