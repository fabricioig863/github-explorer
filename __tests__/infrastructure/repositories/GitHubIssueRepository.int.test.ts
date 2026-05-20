import { http, HttpResponse } from 'msw';

import { NetworkError } from '@/domain/errors/NetworkError';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import { RateLimitError } from '@/domain/errors/RateLimitError';
import { GitHubIssueRepository } from 'src/infra/repositories/GitHubIssueRepository';

import { GITHUB_BASE_URL, server } from '../../test-utils/msw/server';

function makeIssueDto(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 5001,
    number: 12,
    title: 'Bug X',
    state: 'open' as const,
    user: {
      login: 'octocat',
      avatar_url: 'https://github.com/octocat.png',
    },
    labels: [{ id: 1, name: 'bug', color: 'd73a4a' }],
    comments: 3,
    created_at: '2026-02-10T09:00:00Z',
    html_url: 'https://github.com/foo/bar/issues/12',
    ...overrides,
  };
}

describe('GitHubIssueRepository (integração HTTP via msw)', () => {
  describe('list', () => {
    it('usa /search/issues com q="repo:owner/repo type:issue state:open" e ordenação por created desc', async () => {
      let capturedUrl: URL | undefined;
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/issues`, ({ request }) => {
          capturedUrl = new URL(request.url);
          return HttpResponse.json({ total_count: 0, items: [] });
        }),
      );

      await new GitHubIssueRepository().list({
        owner: 'foo',
        repo: 'bar',
        state: 'open',
        page: 1,
        perPage: 20,
      });

      // Decisão de design: /search/issues em vez de /repos/{owner}/{repo}/issues
      // porque o endpoint REST mistura PRs com issues. A busca com type:issue
      // filtra apenas issues reais.
      expect(capturedUrl?.pathname).toBe('/search/issues');
      expect(capturedUrl?.searchParams.get('q')).toBe('repo:foo/bar type:issue state:open');
      expect(capturedUrl?.searchParams.get('sort')).toBe('created');
      expect(capturedUrl?.searchParams.get('order')).toBe('desc');
      expect(capturedUrl?.searchParams.get('page')).toBe('1');
      expect(capturedUrl?.searchParams.get('per_page')).toBe('20');
    });

    it('encaminha state=closed quando solicitado', async () => {
      let capturedQ: string | null = null;
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/issues`, ({ request }) => {
          capturedQ = new URL(request.url).searchParams.get('q');
          return HttpResponse.json({ total_count: 0, items: [] });
        }),
      );

      await new GitHubIssueRepository().list({
        owner: 'foo',
        repo: 'bar',
        state: 'closed',
        page: 1,
        perPage: 20,
      });

      expect(capturedQ).toBe('repo:foo/bar type:issue state:closed');
    });

    it('retorna PaginatedResult<Issue> com mapeamento DTO→domínio e hasNextPage', async () => {
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/issues`, () =>
          HttpResponse.json({
            total_count: 50,
            items: [
              makeIssueDto({ id: 1, title: 'First' }),
              makeIssueDto({ id: 2, title: 'Second' }),
            ],
          }),
        ),
      );

      const result = await new GitHubIssueRepository().list({
        owner: 'foo',
        repo: 'bar',
        state: 'open',
        page: 1,
        perPage: 20,
      });

      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.title).toBe('First');
      expect(result.items[0]?.createdAt).toBeInstanceOf(Date);
      expect(result.items[0]?.author.login).toBe('octocat');
      expect(result.items[0]).not.toHaveProperty('created_at');
      expect(result.items[0]).not.toHaveProperty('html_url');
      expect(result.totalCount).toBe(50);
      expect(result.hasNextPage).toBe(true);
    });

    it.each([
      ['página final preenche o total exato → false', 5, 20, 100, false],
      ['ainda há mais itens → true', 2, 20, 100, true],
    ])('calcula hasNextPage: %s', async (_label, page, perPage, total, expected) => {
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/issues`, () =>
          HttpResponse.json({ total_count: total, items: [] }),
        ),
      );

      const result = await new GitHubIssueRepository().list({
        owner: 'foo',
        repo: 'bar',
        state: 'open',
        page,
        perPage,
      });

      expect(result.hasNextPage).toBe(expected);
    });

    it('propaga RateLimitError em 403 com rate-limit headers', async () => {
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/issues`, () =>
          HttpResponse.json({}, { status: 403, headers: { 'x-ratelimit-remaining': '0' } }),
        ),
      );

      await expect(
        new GitHubIssueRepository().list({
          owner: 'foo',
          repo: 'bar',
          state: 'open',
          page: 1,
          perPage: 20,
        }),
      ).rejects.toBeInstanceOf(RateLimitError);
    });

    it('propaga NotFoundError em 404 com resourceContext "Issues de owner/repo"', async () => {
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/issues`, () => HttpResponse.json({}, { status: 404 })),
      );

      const promise = new GitHubIssueRepository().list({
        owner: 'foo',
        repo: 'bar',
        state: 'open',
        page: 1,
        perPage: 20,
      });
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      await promise.catch((err: NotFoundError) => {
        expect(err.message).toContain('Issues de foo/bar');
      });
    });

    it('propaga NetworkError em erro de rede', async () => {
      server.use(http.get(`${GITHUB_BASE_URL}/search/issues`, () => HttpResponse.error()));

      await expect(
        new GitHubIssueRepository().list({
          owner: 'foo',
          repo: 'bar',
          state: 'open',
          page: 1,
          perPage: 20,
        }),
      ).rejects.toBeInstanceOf(NetworkError);
    });
  });

  describe('countOpen', () => {
    it('envia per_page=1 (otimização — só precisamos do total_count) e retorna o total', async () => {
      let capturedUrl: URL | undefined;
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/issues`, ({ request }) => {
          capturedUrl = new URL(request.url);
          return HttpResponse.json({ total_count: 142, items: [] });
        }),
      );

      const count = await new GitHubIssueRepository().countOpen({ owner: 'foo', repo: 'bar' });

      expect(capturedUrl?.searchParams.get('q')).toBe('repo:foo/bar type:issue state:open');
      expect(capturedUrl?.searchParams.get('per_page')).toBe('1');
      expect(count).toBe(142);
    });

    it('propaga RateLimitError em 429', async () => {
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/issues`, () => HttpResponse.json({}, { status: 429 })),
      );

      await expect(
        new GitHubIssueRepository().countOpen({ owner: 'foo', repo: 'bar' }),
      ).rejects.toBeInstanceOf(RateLimitError);
    });

    it('propaga NotFoundError em 404 com resourceContext "Contagem de issues de owner/repo"', async () => {
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/issues`, () => HttpResponse.json({}, { status: 404 })),
      );

      const promise = new GitHubIssueRepository().countOpen({ owner: 'foo', repo: 'bar' });
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      await promise.catch((err: NotFoundError) => {
        expect(err.message).toContain('Contagem de issues de foo/bar');
      });
    });
  });
});
