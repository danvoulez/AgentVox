// Verificar a estrutura e validade do token JWT
require('dotenv').config({ path: '.env.local' });

function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Token não tem 3 partes' };
    }
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    console.log('Header:', JSON.stringify(header, null, 2));
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // Verificar expiração
    if (payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      const now = new Date();
      
      console.log('Data de expiração:', expirationDate.toISOString());
      console.log('Data atual:', now.toISOString());
      
      if (now > expirationDate) {
        return { valid: false, error: 'Token expirado' };
      }
    }
    
    // Verificar campos esperados para um token Supabase
    if (!payload.iss || !payload.iss.includes('supabase')) {
      return { valid: false, error: 'Token não parece ser do Supabase' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

const token = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('Analisando token JWT:', token.substring(0, 10) + '...');
const result = decodeJWT(token);

if (result.valid) {
  console.log('✅ Token JWT parece válido!');
} else {
  console.log('❌ Token JWT inválido:', result.error);
}
