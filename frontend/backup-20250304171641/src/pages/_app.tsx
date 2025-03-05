import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { VoxProvider } from '@/contexts/VoxContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DecisionProvider } from '@/contexts/DecisionContext';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
      <ThemeProvider>
        <DecisionProvider>
          <VoxProvider>
            <Component {...pageProps} />
          </VoxProvider>
        </DecisionProvider>
      </ThemeProvider>
    </SessionContextProvider>
  );
}
