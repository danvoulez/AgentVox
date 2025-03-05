import React from 'react';
import styles from './ErrorFallback.module.css';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <h2 className={styles.errorTitle}>Algo deu errado</h2>
        <p className={styles.errorMessage}>
          {error?.message || 'Ocorreu um erro inesperado'}
        </p>
        {resetErrorBoundary && (
          <button 
            onClick={resetErrorBoundary}
            className={styles.errorButton}
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
