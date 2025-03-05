import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Error.module.css';

export default function ErrorPage() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Erro - AgentVox</title>
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>
          Oops! Algo deu errado
        </h1>
        
        <p className={styles.description}>
          Estamos enfrentando problemas técnicos.
        </p>
        
        <div className={styles.grid}>
          <Link href="/" className={styles.card}>
            <h2>Voltar para o início &rarr;</h2>
            <p>Retorne para a página inicial e tente novamente.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
