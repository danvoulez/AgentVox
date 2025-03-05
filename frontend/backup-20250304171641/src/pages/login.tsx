import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useVox } from '@/contexts/VoxContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/utils/supabase';
import ThemeSelector from '@/components/ThemeSelector';
import ThemeClock from '@/components/ThemeClock';
import ThemeInfo from '@/components/ThemeInfo';
import { Mic } from 'lucide-react';

export default function Login() {
  const { user, isLoading } = useVox();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to home
  }

  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-black to-gray-900 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeSelector />
      </div>
      <div className="absolute top-4 left-4 hidden sm:block">
        <ThemeClock size="sm" showThemeInfo={false} />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center">
            <Mic className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Welcome to Agent Vox
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          Your personal AI assistant with memory and evolution
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-6 flex justify-center">
          <ThemeInfo showDetails={false} />
        </div>
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={['google', 'github']}
            redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/` : undefined}
            magicLink={true}
          />
        </div>
      </div>
    </div>
  );
}
