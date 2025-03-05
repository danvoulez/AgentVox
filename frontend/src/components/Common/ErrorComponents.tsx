// Este arquivo exporta todos os componentes de erro em um único lugar
import ErrorBoundary from './ErrorBoundary';
import ErrorMessage from './ErrorMessage';
import LoadingError from './LoadingError';
import NotFound from './NotFound';
import AlertMessage from './AlertMessage';
import LoadingSpinner from './LoadingSpinner';
import ValidationError from './ValidationError';
import NetworkError from './NetworkError';
import PermissionError from './PermissionError';
import TimeoutError from './TimeoutError';

// Exportações nomeadas para uso com destructuring
export {
  ErrorBoundary,
  ErrorMessage,
  LoadingError,
  NotFound,
  AlertMessage,
  LoadingSpinner,
  ValidationError,
  NetworkError,
  PermissionError,
  TimeoutError
};

// Exportação default como objeto para uso com namespace
const ErrorComponents = {
  ErrorBoundary,
  ErrorMessage,
  LoadingError,
  NotFound,
  AlertMessage,
  LoadingSpinner,
  ValidationError,
  NetworkError,
  PermissionError,
  TimeoutError
};

export default ErrorComponents;
