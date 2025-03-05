import { ReactNode } from 'react';
import Head from 'next/head';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  heading: string;
  subheading?: string;
}

/**
 * Layout comum para as páginas de autenticação
 */
const AuthLayout = ({ 
  children, 
  title, 
  description, 
  heading, 
  subheading 
}: AuthLayoutProps) => {
  return (
    <>
      <Head>
        <title>{`${title} | AgentVox`}</title>
        <meta name="description" content={description} />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md py-12 px-4 md:px-8">
          <div
            className="p-8 border border-gray-200 rounded-lg shadow-lg bg-white w-full"
          >
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">AgentVox</h1>
              <p className="mt-2 text-gray-600 font-medium">
                {heading}
              </p>
              {subheading && (
                <p className="mt-1 text-sm text-gray-500">
                  {subheading}
                </p>
              )}
            </div>
            
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;
