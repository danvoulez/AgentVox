import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de login simples
    router.replace('/simple-login');
  }, [router]);

  return (
    <div className="font-sans max-w-md mx-auto p-8 flex items-center justify-center min-h-screen">
      <Head>
        <title>Redirecionando... | AgentVox</title>
      </Head>
      
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">AgentVox</h1>
        <p className="text-gray-600">Redirecionando para a página de login simples...</p>
        <div className="mt-4 animate-pulse">Carregando...</div>
      </div>
    </div>
  );
}
