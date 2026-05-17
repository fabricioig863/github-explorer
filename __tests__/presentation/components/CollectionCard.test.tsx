import { fireEvent, screen } from '@testing-library/react-native';

import { CollectionCard } from '@/presentation/components/CollectionCard';

import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('CollectionCard', () => {
  it('renders title and pluralised repo count', () => {
    renderWithProviders(
      <CollectionCard title="Mobile" count={18} iconColor="#000" glyph="☰" />,
      { withNavigation: false },
    );
    expect(screen.getByText('Mobile')).toBeTruthy();
    expect(screen.getByText('18 repos')).toBeTruthy();
  });

  it('uses singular "repo" when count is exactly 1', () => {
    renderWithProviders(
      <CollectionCard title="AI & ML" count={1} iconColor="#000" glyph="✪" />,
      { withNavigation: false },
    );
    expect(screen.getByText('1 repo')).toBeTruthy();
  });

  it('is non-interactive when onPress is omitted', () => {
    renderWithProviders(
      <CollectionCard title="Tools" count={3} iconColor="#000" glyph="⛭" />,
      { withNavigation: false },
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('emits onPress when tapped', () => {
    const onPress = jest.fn();
    renderWithProviders(
      <CollectionCard
        title="Backend"
        count={5}
        iconColor="#C53030"
        glyph="▨"
        onPress={onPress}
      />,
      { withNavigation: false },
    );
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
