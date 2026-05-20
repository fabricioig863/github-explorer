import { http, HttpResponse } from 'msw';

import { NetworkError } from '@/domain/errors/NetworkError';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import { RateLimitError } from '@/domain/errors/RateLimitError';
import { UnexpectedError } from '@/domain/errors/UnexpectedError';
import { GitHubRepoRepository } from 'src/infra/repositories/GitHubRepoRepository';

import { GITHUB_BASE_URL, server } from '../../test-utils/msw/server';

function makeRepoDto(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 10270250,
    name: 'react',
    full_name: 'facebook/react',
    owner: {
      id: 69631,
      login: 'facebook',
      avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
      type: 'Organization' as const,
    },
    description: 'A library',
    stargazers_count: 230000,
    forks_count: 47000,
    watchers_count: 230000,
    open_issues_count: 700,
    language: 'JavaScript',
    html_url: 'https://github.com/facebook/react',
    pushed_at: '2026-04-15T10:00:00Z',
    topics: ['react', 'ui'],
    license: { name: 'MIT', spdx_id: 'MIT' },
    ...overrides,
  };
}

describe('GitHubRepoRepository (integração HTTP via msw)', () => {
  describe('search', () => {
    it('faz GET /search/repositories com q/sort/order/page/per_page corretos', async () => {
      let capturedUrl: URL | undefined;
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/repositories`, ({ request }) => {
          capturedUrl = new URL(request.url);
          return HttpResponse.json({
            total_count: 1,
            incomplete_results: false,
            items: [makeRepoDto()],
          });
        }),
      );

      const repo = new GitHubRepoRepository();
      await repo.search({ query: 'react', page: 3, perPage: 25 });

      expect(capturedUrl).toBeDefined();
      expect(capturedUrl?.searchParams.get('q')).toBe('react in:name,description');
      expect(capturedUrl?.searchParams.get('sort')).toBe('stars');
      expect(capturedUrl?.searchParams.get('order')).toBe('desc');
      expect(capturedUrl?.searchParams.get('page')).toBe('3');
      expect(capturedUrl?.searchParams.get('per_page')).toBe('25');
    });

    it('constrói q como "<termo> in:name,description" para termo livre', async () => {
      let capturedQ: string | null = null;
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/repositories`, ({ request }) => {
          capturedQ = new URL(request.url).searchParams.get('q');
          return HttpResponse.json({ total_count: 0, incomplete_results: false, items: [] });
        }),
      );

      await new GitHubRepoRepository().search({ query: 'react', page: 1, perPage: 20 });

      expect(capturedQ).toBe('react in:name,description');
    });

    it('constrói q como "repo:owner/name" quando a query é um owner/repo path', async () => {
      let capturedQ: string | null = null;
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/repositories`, ({ request }) => {
          capturedQ = new URL(request.url).searchParams.get('q');
          return HttpResponse.json({ total_count: 0, incomplete_results: false, items: [] });
        }),
      );

      await new GitHubRepoRepository().search({
        query: 'facebook/react',
        page: 1,
        perPage: 20,
      });

      expect(capturedQ).toBe('repo:facebook/react');
    });

    it.each([
      ['última página (5*20=100, total=100) → false', 5, 20, 100, false],
      ['penúltima página (4*20=80 < 100) → true', 4, 20, 100, true],
      ['totalCount 0 → false', 1, 20, 0, false],
    ])('calcula hasNextPage: %s', async (_label, page, perPage, total, expected) => {
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/repositories`, () =>
          HttpResponse.json({ total_count: total, incomplete_results: false, items: [] }),
        ),
      );

      const result = await new GitHubRepoRepository().search({ query: 'react', page, perPage });

      expect(result.hasNextPage).toBe(expected);
      expect(result.totalCount).toBe(total);
    });

    it('mapeia DTO via repositoryMapper (pushedAt vira Date, snake_case some)', async () => {
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/repositories`, () =>
          HttpResponse.json({
            total_count: 1,
            incomplete_results: false,
            items: [makeRepoDto({ pushed_at: '2026-04-15T10:00:00Z' })],
          }),
        ),
      );

      const { items } = await new GitHubRepoRepository().search({
        query: 'react',
        page: 1,
        perPage: 20,
      });

      expect(items[0]?.pushedAt).toBeInstanceOf(Date);
      expect(items[0]?.fullName).toBe('facebook/react');
      expect(items[0]).not.toHaveProperty('full_name');
      expect(items[0]).not.toHaveProperty('stargazers_count');
      expect(items[0]?.stars).toBe(230000);
    });

    it('em 403 + x-ratelimit-remaining=0 levanta RateLimitError com resetAt do header', async () => {
      const resetUnix = 1_780_000_000;
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/repositories`, () =>
          HttpResponse.json(
            { message: 'rate limit' },
            {
              status: 403,
              headers: {
                'x-ratelimit-remaining': '0',
                'x-ratelimit-reset': String(resetUnix),
              },
            },
          ),
        ),
      );

      const promise = new GitHubRepoRepository().search({ query: 'react', page: 1, perPage: 20 });

      await expect(promise).rejects.toBeInstanceOf(RateLimitError);
      await promise.catch((err: RateLimitError) => {
        expect(err.resetAt).toBeInstanceOf(Date);
        expect(err.resetAt?.getTime()).toBe(resetUnix * 1000);
      });
    });

    it('em 403 sem rate-limit header levanta UnexpectedError (não RateLimitError)', async () => {
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/repositories`, () =>
          HttpResponse.json({ message: 'forbidden' }, { status: 403 }),
        ),
      );

      await expect(
        new GitHubRepoRepository().search({ query: 'react', page: 1, perPage: 20 }),
      ).rejects.toBeInstanceOf(UnexpectedError);
    });

    it('em 429 levanta RateLimitError', async () => {
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/repositories`, () =>
          HttpResponse.json({ message: 'too many' }, { status: 429 }),
        ),
      );

      await expect(
        new GitHubRepoRepository().search({ query: 'react', page: 1, perPage: 20 }),
      ).rejects.toBeInstanceOf(RateLimitError);
    });

    it('em 404 levanta NotFoundError', async () => {
      server.use(
        http.get(`${GITHUB_BASE_URL}/search/repositories`, () =>
          HttpResponse.json({ message: 'not found' }, { status: 404 }),
        ),
      );

      await expect(
        new GitHubRepoRepository().search({ query: 'react', page: 1, perPage: 20 }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('em erro de rede levanta NetworkError', async () => {
      server.use(http.get(`${GITHUB_BASE_URL}/search/repositories`, () => HttpResponse.error()));

      await expect(
        new GitHubRepoRepository().search({ query: 'react', page: 1, perPage: 20 }),
      ).rejects.toBeInstanceOf(NetworkError);
    });
  });

  describe('getDetails', () => {
    it('chama /repos/${owner}/${repo} e mapeia DTO para Repository', async () => {
      let capturedPath: string | undefined;
      server.use(
        http.get(`${GITHUB_BASE_URL}/repos/:owner/:repo`, ({ request, params }) => {
          capturedPath = new URL(request.url).pathname;
          return HttpResponse.json(makeRepoDto({ full_name: `${params.owner}/${params.repo}` }));
        }),
      );

      const result = await new GitHubRepoRepository().getDetails('facebook', 'react');

      expect(capturedPath).toBe('/repos/facebook/react');
      expect(result.fullName).toBe('facebook/react');
      expect(result.pushedAt).toBeInstanceOf(Date);
    });

    it('em 404 levanta NotFoundError com resourceContext "Repositório owner/repo"', async () => {
      server.use(
        http.get(`${GITHUB_BASE_URL}/repos/:owner/:repo`, () =>
          HttpResponse.json({ message: 'not found' }, { status: 404 }),
        ),
      );

      const promise = new GitHubRepoRepository().getDetails('foo', 'bar');
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      await promise.catch((err: NotFoundError) => {
        expect(err.message).toContain('Repositório foo/bar');
      });
    });

    it('em erro de rede levanta NetworkError', async () => {
      server.use(http.get(`${GITHUB_BASE_URL}/repos/:owner/:repo`, () => HttpResponse.error()));

      await expect(new GitHubRepoRepository().getDetails('foo', 'bar')).rejects.toBeInstanceOf(
        NetworkError,
      );
    });
  });
});
