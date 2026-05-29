import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider as RestyleThemeProvider } from '@shopify/restyle';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';

import { lightTheme } from 'src/infra/theme/lightTheme';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface ProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
  withNavigation?: boolean;
}

export function AllProviders({ children, queryClient, withNavigation = true }: ProvidersProps) {
  const client = queryClient ?? createTestQueryClient();
  const body = (
    <QueryClientProvider client={client}>
      <RestyleThemeProvider theme={lightTheme}>{children}</RestyleThemeProvider>
    </QueryClientProvider>
  );
  if (!withNavigation) return body;
  return <NavigationContainer>{body}</NavigationContainer>;
}

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  withNavigation?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  { queryClient, withNavigation, ...rest }: RenderWithProvidersOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient} withNavigation={withNavigation}>
        {children}
      </AllProviders>
    ),
    ...rest,
  });
}
