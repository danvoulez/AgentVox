import type { NextPage } from 'next';
import LoginForm from '@/components/Auth/LoginForm';
import AuthLayout from '@/components/Auth/AuthLayout';

const LoginPage: NextPage = () => {
  return (
    <AuthLayout 
      title="Login"
      description="Faça login na plataforma AgentVox"
      heading="Entre na sua conta para continuar"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
