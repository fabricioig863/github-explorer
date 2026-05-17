import { fireEvent, screen } from '@testing-library/react-native';

import { SavedRepoRow } from '@/presentation/components/SavedRepoRow';

import { makeSavedRepo } from '../../test-utils/fixtures/savedRepo.fixture';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('SavedRepoRow', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-17T12:00:00Z'));
  });

  afterEach(() => jest.useRealTimers());

  it('renders owner, name, savedAt and language', () => {
    renderWithProviders(
      <SavedRepoRow
        repo={makeSavedRepo({
          ownerLogin: 'facebook',
          name: 'react-native',
          language: 'TypeScript',
          savedAt: new Date('2026-05-17T10:00:00Z'),
        })}
      />,
      { withNavigation: false },
    );

    expect(screen.getByText('facebook')).toBeTruthy();
    expect(screen.getByText('react-native')).toBeTruthy();
    expect(screen.getByText('TypeScript')).toBeTruthy();
    expect(screen.getByText('salvo há cerca de 2 horas')).toBeTruthy();
  });

  it('calls onPress when the row is pressed', () => {
    const onPress = jest.fn();
    renderWithProviders(<SavedRepoRow repo={makeSavedRepo()} onPress={onPress} />, {
      withNavigation: false,
    });
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });
});
