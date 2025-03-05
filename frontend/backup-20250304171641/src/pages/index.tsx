import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useVox } from '@/contexts/VoxContext';
import { useTheme } from '@/contexts/ThemeContext';
import AdvancedVoiceCommandSystem from '@/components/AdvancedVoiceCommandSystem';
import VoxEvolutionDashboard from '@/components/VoxEvolutionDashboard';
import ThemeSelector from '@/components/ThemeSelector';
import ThemeClock from '@/components/ThemeClock';
import ThemeInfo from '@/components/ThemeInfo';
import DecisionMaker from '@/components/DecisionMaker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, BarChart3, Memory, History, Settings, Palette, Lightbulb } from 'lucide-react';

export default function Home() {
  const [showThemeDemo, setShowThemeDemo] = useState(false);
  const { user, isLoading, signOut } = useVox();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('voice');

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <header className="bg-gray-900 shadow-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-white">Agent Vox</h1>
            </div>
          </div>
          <div className="flex items-center">
            <div className="mr-4">
              <ThemeSelector />
            </div>
            <button 
              onClick={() => setShowThemeDemo(!showThemeDemo)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center"
              style={{ backgroundColor: 'rgba(var(--accent-color), 0.2)' }}
            >
              <Palette className="h-3 w-3 mr-1" />
              {showThemeDemo ? 'Ocultar Demo' : 'Demo de Temas'}
            </button>
            <span className="text-sm text-gray-300 mr-4">
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {showThemeDemo && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center space-y-4 p-6 rounded-xl shadow-lg"
                 style={{ backgroundColor: 'rgba(var(--card-bg), 0.5)', borderColor: 'rgba(var(--border-color), 0.3)' }}>
              <h3 className="text-lg font-bold">Relógio Temático</h3>
              <ThemeClock size="md" />
              <p className="text-xs opacity-70 text-center max-w-xs">
                Este relógio muda de aparência automaticamente com base no tema selecionado.
                Ele também mostra o período do dia atual.
              </p>
            </div>
            
            <div className="flex flex-col space-y-4 p-6 rounded-xl shadow-lg"
                 style={{ backgroundColor: 'rgba(var(--card-bg), 0.5)', borderColor: 'rgba(var(--border-color), 0.3)' }}>
              <h3 className="text-lg font-bold text-center">Informações de Tema</h3>
              
              <div className="space-y-4">
                <ThemeInfo showDetails={true} />
                
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(var(--highlight-color), 0.1)' }}>
                  <h4 className="font-medium mb-2 text-xs">Variáveis CSS Disponíveis:</h4>
                  <ul className="space-y-1 text-xs">
                    <li><code>--fg-color</code>: Cor de texto principal</li>
                    <li><code>--bg-color</code>: Cor de fundo principal</li>
                    <li><code>--accent-color</code>: Cor de destaque</li>
                    <li><code>--card-bg</code>: Fundo de cartões</li>
                    <li><code>--border-color</code>: Cor de bordas</li>
                    <li><code>--highlight-color</code>: Cor para destaques</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="voice" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="voice" className="flex items-center justify-center">
              <Mic className="h-4 w-4 mr-2" />
              Voice Command
            </TabsTrigger>
            <TabsTrigger value="evolution" className="flex items-center justify-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Evolution
            </TabsTrigger>
            <TabsTrigger value="memory" className="flex items-center justify-center">
              <Memory className="h-4 w-4 mr-2" />
              Memory
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center justify-center">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="decisions" className="flex items-center justify-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Decisões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="mt-6">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-center max-w-2xl">
                <h2 className="text-3xl font-bold text-white mb-4">Talk to Vox</h2>
                <p className="text-gray-300">
                  Vox is your personal AI assistant. Ask questions, give commands, or just chat.
                  The more you interact, the smarter Vox becomes.
                </p>
              </div>
              <AdvancedVoiceCommandSystem />
            </div>
          </TabsContent>

          <TabsContent value="evolution" className="mt-6">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-center max-w-2xl">
                <h2 className="text-3xl font-bold text-white mb-4">Vox Evolution</h2>
                <p className="text-gray-300">
                  Watch as Vox grows and evolves with each interaction. Track intelligence levels,
                  skills, and stats as your personal AI assistant becomes more capable.
                </p>
              </div>
              <VoxEvolutionDashboard />
            </div>
          </TabsContent>

          <TabsContent value="memory" className="mt-6">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-center max-w-2xl">
                <h2 className="text-3xl font-bold text-white mb-4">Vox Memory</h2>
                <p className="text-gray-300">
                  View and manage what Vox remembers about you. These memories help Vox
                  provide more personalized assistance.
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl shadow-md p-6 w-full max-w-3xl">
                <p className="text-center text-gray-400">
                  Memory management coming soon...
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-center max-w-2xl">
                <h2 className="text-3xl font-bold text-white mb-4">Command History</h2>
                <p className="text-gray-300">
                  Review your past interactions with Vox. See what commands you've given
                  and how Vox responded.
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl shadow-md p-6 w-full max-w-3xl">
                <p className="text-center text-gray-400">
                  Command history coming soon...
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="decisions" className="mt-6">
            <div className="flex flex-col space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-4">Horizonte de Decisões</h2>
                <p className="text-gray-300">
                  Gerencie suas decisões importantes com base no período do dia ideal para cada tipo de escolha.
                  O sistema se adapta ao seu tema atual e oferece recomendações personalizadas.
                </p>
              </div>
              <div className="w-full">
                <DecisionMaker />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Agent Vox. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
