import React, { useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Home() {
  const [activeTab, setActiveTab] = useState('voice');
  const [showThemeDemo, setShowThemeDemo] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold">Agent Vox</h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </header>

      {showThemeDemo && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center space-y-4 p-6 rounded-xl shadow-lg bg-card">
              <h3 className="text-lg font-bold">Tema Atual</h3>
              <p className="text-xs opacity-70 text-center max-w-xs">
                O tema atual é aplicado a todos os componentes da interface.  
              </p>
            </div>
            
            <div className="flex flex-col space-y-4 p-6 rounded-xl shadow-lg bg-card">
              <h3 className="text-lg font-bold text-center">Informações de Tema</h3>
              
              <div className="space-y-4">
                <div className="p-3 rounded-lg text-sm bg-muted/20">
                  <h4 className="font-medium mb-2 text-xs">Variáveis CSS Disponíveis:</h4>
                  <ul className="space-y-1 text-xs">
                    <li><code>--background</code>: Cor de fundo principal</li>
                    <li><code>--foreground</code>: Cor de texto principal</li>
                    <li><code>--primary</code>: Cor primária</li>
                    <li><code>--secondary</code>: Cor secundária</li>
                    <li><code>--muted</code>: Cor para elementos sutis</li>
                    <li><code>--accent</code>: Cor de destaque</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="voice" className="w-full" onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="voice">
              Voice Command
            </TabsTrigger>
            <TabsTrigger value="tracking">
              Delivery Tracking
            </TabsTrigger>
            <TabsTrigger value="about">
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="mt-6">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-center max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">Talk to Vox</h2>
                <p className="text-muted-foreground">
                  Vox is your personal AI assistant. Ask questions, give commands, or just chat.
                  The more you interact, the smarter Vox becomes.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow w-full max-w-md">
                <p className="text-center">Voice command interface coming soon...</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="mt-6">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-center max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">Delivery Tracking</h2>
                <p className="text-muted-foreground">
                  Track your delivery in real-time and communicate with your courier.
                </p>
              </div>
              <div className="w-full">
                <Link href="/delivery-tracking-demo" className="block w-full max-w-md mx-auto">
                  <div className="bg-primary text-primary-foreground p-4 rounded-lg text-center hover:bg-primary/90 transition-colors">
                    Open Delivery Tracking Demo
                  </div>
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-center max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">About Agent Vox</h2>
                <p className="text-muted-foreground">
                  Agent Vox is a demonstration of real-time communication and tracking capabilities.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow w-full max-w-2xl">
                <p className="text-center">
                  This project showcases real-time delivery tracking, chat functionality, and voice communication
                  using modern web technologies.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Agent Vox. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
