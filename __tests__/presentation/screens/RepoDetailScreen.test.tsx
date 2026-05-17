import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { NetworkError } from '@/domain/errors/NetworkError';

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

import { RepoDetailScreen } from '@/presentation/screens/RepoDetailScreen';
import { container } from 'src/infra/di/container';

import { makeRepository } from '../../test-utils/fixtures/repository.fixture';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

const detailsMock = container.getRepoDetailsUseCase.execute as jest.Mock;
const countMock = container.countOpenIssuesUseCase.execute as jest.Mock;
const isSavedMock = container.isRepoSavedUseCase.execute as jest.Mock;
const saveMock = container.saveRepoUseCase.execute as jest.Mock;
const unsaveMock = container.unsaveRepoUseCase.execute as jest.Mock;

function makeProps(overrides?: { owner?: string; repo?: string }) {
  const navigate = jest.fn();
  const setOptions = jest.fn();
  return {
    navigate,
    setOptions,
    props: {
      navigation: {
        navigate,
        goBack: jest.fn(),
        setOptions,
        setParams: jest.fn(),
        addListener: jest.fn(() => () => {}),
      } as never,
      route: {
        key: 'k',
        name: 'RepoDetail',
        params: { owner: overrides?.owner ?? 'foo', repo: overrides?.repo ?? 'bar' },
      } as never,
    },
  };
}

describe('RepoDetailScreen', () => {
  beforeEach(() => {
    detailsMock.mockReset();
    countMock.mockReset();
    isSavedMock.mockReset();
    saveMock.mockReset();
    unsaveMock.mockReset();
    countMock.mockResolvedValue(0);
    isSavedMock.mockResolvedValue(false);
    saveMock.mockResolvedValue(undefined);
    unsaveMock.mockResolvedValue(undefined);
  });

  it('renders hero, stats grid in uppercase eyebrow and meta rows', async () => {
    detailsMock.mockResolvedValueOnce(
      makeRepository({
        name: 'react-native',
        owner: { ...makeRepository().owner, login: 'facebook', type: 'Organization' },
        stars: 120000,
        forks: 24000,
        watchers: 2500,
        language: 'TypeScript',
        license: 'MIT',
        topics: ['react', 'mobile'],
      }),
    );
    countMock.mockResolvedValueOnce(142);

    const { props } = makeProps({ owner: 'facebook', repo: 'react-native' });
    renderWithProviders(<RepoDetailScreen {...props} />, { withNavigation: false });

    await screen.findByText('react-native');
    expect(screen.getByText('@facebook · Organization')).toBeTruthy();
    expect(screen.getByText('ESTRELAS')).toBeTruthy();
    expect(screen.getByText('FORKS')).toBeTruthy();
    expect(screen.getByText('WATCH')).toBeTruthy();
    expect(screen.getByText('Linguagem')).toBeTruthy();
    expect(screen.getByText('Licença')).toBeTruthy();
    expect(screen.getByText('Último commit')).toBeTruthy();
    expect(screen.getByText('MIT')).toBeTruthy();
    expect(screen.getByText('react')).toBeTruthy();
    expect(screen.getByText('mobile')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Ver 142 issues abertas')).toBeTruthy());
  });

  it('singularises the CTA when there is exactly one open issue', async () => {
    detailsMock.mockResolvedValueOnce(makeRepository());
    countMock.mockResolvedValueOnce(1);

    const { props } = makeProps();
    renderWithProviders(<RepoDetailScreen {...props} />, { withNavigation: false });

    await screen.findByText('Ver 1 issue aberta');
  });

  it('navigates to Issues stack when the CTA is pressed', async () => {
    detailsMock.mockResolvedValueOnce(makeRepository());
    countMock.mockResolvedValueOnce(3);

    const { navigate, props } = makeProps({ owner: 'foo', repo: 'bar' });
    renderWithProviders(<RepoDetailScreen {...props} />, { withNavigation: false });

    const cta = await screen.findByText('Ver 3 issues abertas');
    fireEvent.press(cta);
    expect(navigate).toHaveBeenCalledWith('Issues', { owner: 'foo', repo: 'bar' });
  });

  it('renders an error EmptyState with pt-BR copy when the details query fails', async () => {
    detailsMock.mockRejectedValueOnce(new NetworkError());

    const { props } = makeProps();
    renderWithProviders(<RepoDetailScreen {...props} />, { withNavigation: false });

    await screen.findByText('Algo deu errado');
    expect(screen.getByText('Sem conexão. Verifique sua internet e tente novamente.')).toBeTruthy();
  });

  it('configures navigation.setOptions with title and headerRight after data loads', async () => {
    detailsMock.mockResolvedValueOnce(makeRepository());
    const { setOptions, props } = makeProps();
    renderWithProviders(<RepoDetailScreen {...props} />, { withNavigation: false });

    await screen.findByText('hello-world');
    await waitFor(() => {
      const calls = setOptions.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const last = calls[calls.length - 1]?.[0] as { title: string; headerRight: () => unknown };
      expect(last.title).toBe('Repositório');
      expect(typeof last.headerRight).toBe('function');
    });
  });
});
