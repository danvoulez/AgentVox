import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Agent Vox</h1>
      </header>

      <main>
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Páginas de Teste</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/test" style={{ color: '#0070f3', textDecoration: 'none' }}>Página de Teste Simples</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/supabase-test" style={{ color: '#0070f3', textDecoration: 'none' }}>Teste do Supabase</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/login-test" style={{ color: '#0070f3', textDecoration: 'none' }}>Teste de Login</Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/supabase-connection-test" style={{ color: '#0070f3', textDecoration: 'none' }}>Teste de Conexão com Supabase</Link>
            </li>
          </ul>
        </div>
      </main>

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd', textAlign: 'center', fontSize: '14px' }}>
        &copy; {new Date().getFullYear()} Agent Vox. All rights reserved.
      </footer>
    </div>
  );
}
