import { fireEvent, screen } from '@testing-library/react-native';

import { BookmarkButton } from '@/presentation/components/BookmarkButton';

import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('BookmarkButton', () => {
  it('uses the "Salvar repositório" label when not saved', () => {
    renderWithProviders(<BookmarkButton isSaved={false} onPress={jest.fn()} />, {
      withNavigation: false,
    });
    expect(screen.getByLabelText('Salvar repositório')).toBeTruthy();
  });

  it('uses the "Remover dos salvos" label when saved', () => {
    renderWithProviders(<BookmarkButton isSaved onPress={jest.fn()} />, {
      withNavigation: false,
    });
    expect(screen.getByLabelText('Remover dos salvos')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    renderWithProviders(<BookmarkButton isSaved={false} onPress={onPress} />, {
      withNavigation: false,
    });
    fireEvent.press(screen.getByLabelText('Salvar repositório'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('respects disabled — no press, accessibilityState reflects state', () => {
    const onPress = jest.fn();
    renderWithProviders(<BookmarkButton isSaved={false} disabled onPress={onPress} />, {
      withNavigation: false,
    });
    const node = screen.getByLabelText('Salvar repositório');
    expect(node.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(node);
    expect(onPress).not.toHaveBeenCalled();
  });
});
