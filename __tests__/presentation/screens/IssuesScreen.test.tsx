import { screen } from '@testing-library/react-native';

jest.mock('src/infra/di/container', () => ({
  container: {
    searchReposUseCase: { execute: jest.fn() },
    getRepoDetailsUseCase: { execute: jest.fn() },
    listIssuesUseCase: { execute: jest.fn() },
    countOpenIssuesUseCase: { execute: jest.fn() },
    getUserProfileUseCase: { execute: jest.fn() },
    getRecentCommitsUseCase: { execute: jest.fn() },
  },
}));

import { IssuesScreen } from '@/presentation/screens/IssuesScreen';
import { container } from 'src/infra/di/container';

import { makeIssue } from '../../test-utils/fixtures/issue.fixture';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

const listMock = container.listIssuesUseCase.execute as jest.Mock;
const countMock = container.countOpenIssuesUseCase.execute as jest.Mock;

function makeProps() {
  return {
    navigation: {} as never,
    route: { key: 'k', name: 'Issues', params: { owner: 'foo', repo: 'bar' } } as never,
  };
}

describe('IssuesScreen', () => {
  beforeEach(() => {
    listMock.mockReset();
    countMock.mockReset();
  });

  it('renders the first page of issues and the open-count header', async () => {
    listMock.mockResolvedValueOnce({
      items: [
        makeIssue({ id: 1, title: 'First issue' }),
        makeIssue({ id: 2, title: 'Second issue' }),
      ],
      totalCount: 50,
      hasNextPage: true,
    });
    countMock.mockResolvedValueOnce(50);

    renderWithProviders(<IssuesScreen {...makeProps()} />, { withNavigation: false });

    await screen.findByText('First issue');
    expect(screen.getByText('Second issue')).toBeTruthy();
    expect(screen.getByText(/50.+issues abertas/)).toBeTruthy();
  });

  it('renders the empty state when there are no issues', async () => {
    listMock.mockResolvedValueOnce({ items: [], totalCount: 0, hasNextPage: false });
    countMock.mockResolvedValueOnce(0);

    renderWithProviders(<IssuesScreen {...makeProps()} />, { withNavigation: false });

    await screen.findByText('Nenhuma issue aberta');
    expect(screen.getByText('foo/bar não possui issues abertas no momento.')).toBeTruthy();
  });
});
