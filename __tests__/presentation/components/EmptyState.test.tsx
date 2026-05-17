import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { EmptyState } from '@/presentation/components/EmptyState';

import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('EmptyState', () => {
  it('always renders the title', () => {
    renderWithProviders(<EmptyState title="Sem resultados" />, { withNavigation: false });
    expect(screen.getByText('Sem resultados')).toBeTruthy();
  });

  it('renders description when provided', () => {
    renderWithProviders(
      <EmptyState title="Sem resultados" description="Tente outra busca." />,
      { withNavigation: false },
    );
    expect(screen.getByText('Tente outra busca.')).toBeTruthy();
  });

  it('does not render description container when omitted', () => {
    renderWithProviders(<EmptyState title="Sem resultados" />, { withNavigation: false });
    expect(screen.queryByText('Tente outra busca.')).toBeNull();
  });

  it('renders the action node when provided', () => {
    const onTap = jest.fn();
    renderWithProviders(
      <EmptyState
        title="Erro"
        action={<Text onPress={onTap}>Botão custom</Text>}
      />,
      { withNavigation: false },
    );
    const btn = screen.getByText('Botão custom');
    fireEvent.press(btn);
    expect(onTap).toHaveBeenCalled();
  });

  it('renders a "Tentar novamente" button when onRetry is provided', () => {
    const onRetry = jest.fn();
    renderWithProviders(<EmptyState title="Erro" onRetry={onRetry} />, {
      withNavigation: false,
    });
    const button = screen.getByLabelText('Tentar novamente');
    fireEvent.press(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render the retry button when onRetry is omitted', () => {
    renderWithProviders(<EmptyState title="Erro" />, { withNavigation: false });
    expect(screen.queryByLabelText('Tentar novamente')).toBeNull();
  });
});
