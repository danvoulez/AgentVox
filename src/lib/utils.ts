import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes do Tailwind CSS de forma inteligente, evitando conflitos
 * @param inputs Classes CSS a serem combinadas
 * @returns String de classes CSS combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
