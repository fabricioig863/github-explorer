import { fireEvent, screen, waitFor } from '@testing-library/react-native';

jest.mock('src/infra/di/container', () => ({
  container: {
    searchReposUseCase: { execute: jest.fn() },
    getRepoDetailsUseCase: { execute: jest.fn() },
    listIssuesUseCase: { execute: jest.fn() },
    countOpenIssuesUseCase: { execute: jest.fn() },
  },
}));

import { NetworkError } from '@/domain/errors/NetworkError';
import { SearchScreen } from '@/presentation/screens/SearchScreen';
import { container } from 'src/infra/di/container';

import { makeRepository } from '../../test-utils/fixtures/repository.fixture';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

const executeMock = container.searchReposUseCase.execute as jest.Mock;

function makeStubNavigation() {
  return {
    navigate: jest.fn(),
    addListener: jest.fn(() => () => {}),
    setOptions: jest.fn(),
    setParams: jest.fn(),
    goBack: jest.fn(),
  } as never;
}

describe('SearchScreen', () => {
  beforeEach(() => executeMock.mockReset());

  it('shows the prompt empty state when the query is too short', () => {
    renderWithProviders(
      <SearchScreen navigation={makeStubNavigation()} route={{ key: 'k', name: 'Search' } as never} />,
      { withNavigation: false },
    );
    expect(screen.getByText('Busque um repositório')).toBeTruthy();
    expect(screen.getByText('Digite ao menos 2 caracteres para começar.')).toBeTruthy();
  });

  it('debounces input, queries the use case and renders results', async () => {
    executeMock.mockResolvedValueOnce({
      items: [makeRepository({ id: 1, name: 'react-native', fullName: 'fb/react-native' })],
      totalCount: 1,
      hasNextPage: false,
    });

    renderWithProviders(
      <SearchScreen navigation={makeStubNavigation()} route={{ key: 'k', name: 'Search' } as never} />,
      { withNavigation: false },
    );

    fireEvent.changeText(screen.getByPlaceholderText('react native, typescript...'), 'react');

    await waitFor(() => expect(executeMock).toHaveBeenCalled(), { timeout: 2000 });
    expect(executeMock).toHaveBeenCalledWith({ query: 'react', page: 1, perPage: 20 });
    await screen.findByText('react-native', {}, { timeout: 2000 });
    expect(screen.getByText('1 resultado')).toBeTruthy();
  });

  it('renders path-aware empty copy when an owner/repo query returns nothing', async () => {
    executeMock.mockResolvedValueOnce({ items: [], totalCount: 0, hasNextPage: false });

    renderWithProviders(
      <SearchScreen navigation={makeStubNavigation()} route={{ key: 'k', name: 'Search' } as never} />,
      { withNavigation: false },
    );

    fireEvent.changeText(
      screen.getByPlaceholderText('react native, typescript...'),
      'openai/missing-repo',
    );

    await screen.findByText('Nenhum repositório encontrado', {}, { timeout: 2000 });
    expect(screen.getByText(/owner\/repositório/)).toBeTruthy();
  });

  it('renders an error EmptyState with pt-BR message when the use case rejects', async () => {
    executeMock.mockRejectedValueOnce(new NetworkError());

    renderWithProviders(
      <SearchScreen navigation={makeStubNavigation()} route={{ key: 'k', name: 'Search' } as never} />,
      { withNavigation: false },
    );

    fireEvent.changeText(screen.getByPlaceholderText('react native, typescript...'), 'react');

    await screen.findByText('Algo deu errado', {}, { timeout: 2000 });
    expect(screen.getByText('Sem conexão. Verifique sua internet e tente novamente.')).toBeTruthy();
  });
});
