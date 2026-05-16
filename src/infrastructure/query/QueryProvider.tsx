import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { queryClient } from '@/infrastructure/query/queryClient';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Wrapper do QueryClientProvider com nosso queryClient configurado.
 * Deve envolver toda a árvore — montado no App.tsx antes da navegação.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
