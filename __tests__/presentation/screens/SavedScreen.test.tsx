import { fireEvent, screen, waitFor } from '@testing-library/react-native';

jest.mock('src/infra/di/container', () => ({
  container: {
    searchReposUseCase: { execute: jest.fn() },
    getRepoDetailsUseCase: { execute: jest.fn() },
    listIssuesUseCase: { execute: jest.fn() },
    countOpenIssuesUseCase: { execute: jest.fn() },
    listSavedReposUseCase: { execute: jest.fn() },
    saveRepoUseCase: { execute: jest.fn() },
    unsaveRepoUseCase: { execute: jest.fn() },
    isRepoSavedUseCase: { execute: jest.fn() },
  },
}));

jest.mock('src/infra/theme/AppThemeProvider', () => ({
  useThemeMode: () => ({
    mode: 'light',
    resolvedScheme: 'light',
    setMode: jest.fn(),
    isHydrated: true,
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

import { SavedScreen } from '@/presentation/screens/SavedScreen';
import { container } from 'src/infra/di/container';

import { makeSavedRepo } from '../../test-utils/fixtures/savedRepo.fixture';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

const listMock = container.listSavedReposUseCase.execute as jest.Mock;

function makeProps() {
  const navigate = jest.fn();
  return {
    navigate,
    props: {
      navigation: {
        navigate,
        goBack: jest.fn(),
        setOptions: jest.fn(),
        setParams: jest.fn(),
        addListener: jest.fn(() => () => {}),
      } as never,
      route: { key: 'k', name: 'SavedTab' } as never,
    },
  };
}

describe('SavedScreen', () => {
  beforeEach(() => {
    listMock.mockReset();
  });

  it('renders the header and the three segmented tabs with total count', async () => {
    listMock.mockResolvedValueOnce([
      makeSavedRepo({ id: 1 }),
      makeSavedRepo({ id: 2, fullName: 'a/b', name: 'b' }),
    ]);

    const { props } = makeProps();
    renderWithProviders(<SavedScreen {...props} />, { withNavigation: false });

    expect(screen.getByText('Salvos')).toBeTruthy();
    expect(screen.getByText('Coleções')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Todos · 2')).toBeTruthy());
    expect(screen.getByText('Recentes')).toBeTruthy();
  });

  it('renders the four pre-defined collections with their counts', async () => {
    listMock.mockResolvedValueOnce([
      makeSavedRepo({ id: 1, language: 'Swift' }),
      makeSavedRepo({ id: 2, language: 'Kotlin' }),
      makeSavedRepo({ id: 3, language: 'Go' }),
    ]);

    const { props } = makeProps();
    renderWithProviders(<SavedScreen {...props} />, { withNavigation: false });

    await waitFor(() => expect(screen.getByText('Mobile')).toBeTruthy());
    expect(screen.getByText('Backend')).toBeTruthy();
    expect(screen.getByText('Ferramentas')).toBeTruthy();
    expect(screen.getByText('AI & ML')).toBeTruthy();
    expect(screen.getByText('2 repos')).toBeTruthy(); // Mobile
    expect(screen.getByText('1 repo')).toBeTruthy(); // Backend
  });

  it('shows empty state copy when there are no saved repos and Todos tab is active', async () => {
    listMock.mockResolvedValueOnce([]);

    const { props } = makeProps();
    renderWithProviders(<SavedScreen {...props} />, { withNavigation: false });

    await waitFor(() => expect(screen.getByText('Todos · 0')).toBeTruthy());
    fireEvent.press(screen.getByLabelText('Todos · 0'));
    expect(screen.getByText('Você ainda não salvou nenhum repositório')).toBeTruthy();
  });

  it('opens the repo detail when a row is pressed', async () => {
    listMock.mockResolvedValueOnce([
      makeSavedRepo({
        id: 1,
        fullName: 'facebook/react-native',
        name: 'react-native',
        ownerLogin: 'facebook',
      }),
    ]);

    const { navigate, props } = makeProps();
    renderWithProviders(<SavedScreen {...props} />, { withNavigation: false });

    await waitFor(() => expect(screen.getByText('Todos · 1')).toBeTruthy());
    fireEvent.press(screen.getByLabelText('Recentes'));
    const row = await screen.findByText('react-native');
    fireEvent.press(row);

    expect(navigate).toHaveBeenCalledWith('ExploreTab', {
      screen: 'RepoDetail',
      params: { owner: 'facebook', repo: 'react-native' },
    });
  });
});
