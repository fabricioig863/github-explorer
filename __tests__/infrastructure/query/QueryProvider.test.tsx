import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { QueryProvider } from 'src/infra/query/QueryProvider';
import { queryClient } from 'src/infra/query/queryClient';

function ClientProbe() {
  const client = useQueryClient();
  // expõe a referência via testID + nome para asserção pelo teste
  return <Text testID="probe-client">{client === queryClient ? 'singleton' : 'other'}</Text>;
}

describe('QueryProvider', () => {
  it('renderiza children dentro do contexto do QueryClient singleton', () => {
    render(
      <QueryProvider>
        <ClientProbe />
      </QueryProvider>,
    );

    expect(screen.getByTestId('probe-client').props.children).toBe('singleton');
  });
});
