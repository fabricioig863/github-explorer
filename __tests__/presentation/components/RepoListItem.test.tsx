import { fireEvent, screen } from '@testing-library/react-native';

import { RepoListItem } from '@/presentation/components/RepoListItem';

import { makeRepository } from '../../test-utils/fixtures/repository.fixture';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('RepoListItem', () => {
  it('renders the repository name, owner login and language', () => {
    const repo = makeRepository({ name: 'react-native', language: 'JavaScript' });
    renderWithProviders(<RepoListItem repo={repo} onPress={jest.fn()} />, {
      withNavigation: false,
    });

    expect(screen.getByText('react-native')).toBeTruthy();
    expect(screen.getByText(repo.owner.login)).toBeTruthy();
    expect(screen.getByText('JavaScript')).toBeTruthy();
  });

  it('renders the description when present', () => {
    renderWithProviders(
      <RepoListItem
        repo={makeRepository({ description: 'A cross-platform framework' })}
        onPress={jest.fn()}
      />,
      { withNavigation: false },
    );

    expect(screen.getByText('A cross-platform framework')).toBeTruthy();
  });

  it('hides the description block when null', () => {
    const repo = makeRepository({ description: null });
    renderWithProviders(<RepoListItem repo={repo} onPress={jest.fn()} />, {
      withNavigation: false,
    });

    expect(screen.queryByText(/cross-platform/)).toBeNull();
  });

  it('formats star counts compactly (1.2k for 1234)', () => {
    renderWithProviders(
      <RepoListItem repo={makeRepository({ stars: 1234 })} onPress={jest.fn()} />,
      { withNavigation: false },
    );

    expect(screen.getByText('1.2k')).toBeTruthy();
  });

  it('shows raw count when stars < 1000', () => {
    renderWithProviders(
      <RepoListItem repo={makeRepository({ stars: 42 })} onPress={jest.fn()} />,
      { withNavigation: false },
    );

    expect(screen.getByText('42')).toBeTruthy();
  });

  it('formats counts >= 10000 as integer-k (12k for 12345)', () => {
    renderWithProviders(
      <RepoListItem repo={makeRepository({ stars: 12345 })} onPress={jest.fn()} />,
      { withNavigation: false },
    );

    expect(screen.getByText('12k')).toBeTruthy();
  });

  it('calls onPress when the card is pressed', () => {
    const onPress = jest.fn();
    renderWithProviders(<RepoListItem repo={makeRepository()} onPress={onPress} />, {
      withNavigation: false,
    });

    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
