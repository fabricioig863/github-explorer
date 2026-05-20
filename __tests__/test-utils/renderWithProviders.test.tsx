import { Text } from 'react-native';

import { createTestQueryClient, renderWithProviders } from './renderWithProviders';

function Probe() {
  return <Text>probe</Text>;
}

describe('renderWithProviders / createTestQueryClient', () => {
  it('cria um QueryClient novo por chamada (não compartilha referência)', () => {
    const a = createTestQueryClient();
    const b = createTestQueryClient();
    expect(a).not.toBe(b);
  });

  it('não vaza dados entre dois renders independentes', () => {
    const clientA = createTestQueryClient();
    const clientB = createTestQueryClient();

    renderWithProviders(<Probe />, { queryClient: clientA, withNavigation: false });
    renderWithProviders(<Probe />, { queryClient: clientB, withNavigation: false });

    clientA.setQueryData(['shared-key'], { from: 'A' });

    expect(clientA.getQueryData(['shared-key'])).toEqual({ from: 'A' });
    expect(clientB.getQueryData(['shared-key'])).toBeUndefined();
  });

  it('renderWithProviders sem queryClient explícito instancia um próprio (isolado do escopo do teste)', () => {
    const external = createTestQueryClient();
    external.setQueryData(['external-key'], { from: 'external' });

    renderWithProviders(<Probe />, { withNavigation: false });

    expect(external.getQueryData(['external-key'])).toEqual({ from: 'external' });
  });
});
