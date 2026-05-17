import { screen } from '@testing-library/react-native';

import { IssueListItem } from '@/presentation/components/IssueListItem';

import { makeIssue, makeLabel } from '../../test-utils/fixtures/issue.fixture';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('IssueListItem', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-17T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders title, issue number and author', () => {
    const issue = makeIssue({
      title: 'Crash on iOS',
      number: 42,
      author: { login: 'alice', avatarUrl: '' },
    });
    renderWithProviders(<IssueListItem issue={issue} />, { withNavigation: false });

    expect(screen.getByText('Crash on iOS')).toBeTruthy();
    expect(screen.getByText('#42')).toBeTruthy();
    expect(screen.getByText('@alice')).toBeTruthy();
  });

  it('renders one badge per label', () => {
    const issue = makeIssue({
      labels: [
        makeLabel({ id: 1, name: 'bug', color: 'd73a4a' }),
        makeLabel({ id: 2, name: 'help wanted', color: '008672' }),
      ],
    });
    renderWithProviders(<IssueListItem issue={issue} />, { withNavigation: false });

    expect(screen.getByText('bug')).toBeTruthy();
    expect(screen.getByText('help wanted')).toBeTruthy();
  });

  it('hides the labels row when there are no labels', () => {
    const issue = makeIssue({ labels: [] });
    renderWithProviders(<IssueListItem issue={issue} />, { withNavigation: false });

    expect(screen.queryByText('bug')).toBeNull();
  });

  it('renders the createdAt as a relative date in pt-BR', () => {
    const issue = makeIssue({ createdAt: new Date('2026-05-14T12:00:00Z') });
    renderWithProviders(<IssueListItem issue={issue} />, { withNavigation: false });

    expect(screen.getByText('há 3 dias')).toBeTruthy();
  });
});
