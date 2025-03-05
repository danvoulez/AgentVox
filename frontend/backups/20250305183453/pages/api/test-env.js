
    export default function handler(req, res) {
      res.status(200).json({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'não definido',
        supabaseKeyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length : 0
      });
    }
  