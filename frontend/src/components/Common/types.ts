import { ReactNode } from 'react';
import { BoxProps, TextProps } from '@chakra-ui/react';

// Tipos comuns para componentes de erro
export interface ErrorComponentProps extends BoxProps {
  message?: string;
  children?: ReactNode;
  onRetry?: () => void;
}

// Tipos para componentes de formulário
export interface FormComponentProps extends TextProps {
  children?: ReactNode;
}
