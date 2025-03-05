import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function UIComponentsDemo() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Componentes UI</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Botões</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
            </Button>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Título do Card</CardTitle>
                <CardDescription>Descrição do card com detalhes adicionais</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Este é o conteúdo principal do card. Aqui você pode colocar qualquer informação relevante.</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Formulário Simples</CardTitle>
                <CardDescription>Preencha os campos abaixo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nome</label>
                  <Input id="name" placeholder="Digite seu nome" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input id="email" type="email" placeholder="Digite seu email" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Enviar</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
                <CardDescription>Resumo do mês atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Vendas</span>
                    <span className="text-lg font-bold">R$ 12.450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Clientes</span>
                    <span className="text-lg font-bold">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Entregas</span>
                    <span className="text-lg font-bold">32</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Ver Relatório Completo</Button>
              </CardFooter>
            </Card>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="default" className="text-sm font-medium">Input Padrão</label>
              <Input id="default" placeholder="Digite algo..." />
            </div>
            <div className="space-y-2">
              <label htmlFor="disabled" className="text-sm font-medium">Input Desabilitado</label>
              <Input id="disabled" placeholder="Não pode ser editado" disabled />
            </div>
            <div className="space-y-2">
              <label htmlFor="with-icon" className="text-sm font-medium">Input com Ícone</label>
              <div className="relative">
                <Input id="with-icon" placeholder="Pesquisar..." className="pl-10" />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="with-button" className="text-sm font-medium">Input com Botão</label>
              <div className="flex gap-2">
                <Input id="with-button" placeholder="Email" />
                <Button>Enviar</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
