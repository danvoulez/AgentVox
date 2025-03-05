import type { NextPage } from 'next';
import Head from 'next/head';
import SignupForm from '@/components/Auth/SignupForm';

const SignupPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{`Cadastro | AgentVox`}</title>
        <meta name="description" content="Crie sua conta na plataforma AgentVox" />
      </Head>
      
      <SignupForm />
    </>
  );
};

export default SignupPage;
