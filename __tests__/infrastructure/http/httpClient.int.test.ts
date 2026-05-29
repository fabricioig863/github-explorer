import { delay, http, HttpResponse } from 'msw';

import { NetworkError } from '@/domain/errors/NetworkError';
import { mapHttpError } from 'src/infra/http/errorMapper';
import { createHttpClient } from 'src/infra/http/httpClient';

import { GITHUB_BASE_URL, server } from '../../test-utils/msw/server';

describe('httpClient (integração HTTP via msw)', () => {
  describe('headers padrão', () => {
    it('envia X-GitHub-Api-Version: 2022-11-28 em toda request', async () => {
      let capturedVersion: string | null = null;
      server.use(
        http.get(`${GITHUB_BASE_URL}/ping`, ({ request }) => {
          capturedVersion = request.headers.get('x-github-api-version');
          return HttpResponse.json({ ok: true });
        }),
      );

      await createHttpClient().get('/ping');

      expect(capturedVersion).toBe('2022-11-28');
    });

    it('envia Accept: application/vnd.github+json', async () => {
      let capturedAccept: string | null = null;
      server.use(
        http.get(`${GITHUB_BASE_URL}/ping`, ({ request }) => {
          capturedAccept = request.headers.get('accept');
          return HttpResponse.json({ ok: true });
        }),
      );

      await createHttpClient().get('/ping');

      expect(capturedAccept).toContain('application/vnd.github+json');
    });
  });

  describe('autenticação via EXPO_PUBLIC_GITHUB_TOKEN', () => {
    const ORIGINAL_TOKEN = process.env.EXPO_PUBLIC_GITHUB_TOKEN;

    afterEach(() => {
      if (ORIGINAL_TOKEN === undefined) {
        delete process.env.EXPO_PUBLIC_GITHUB_TOKEN;
      } else {
        process.env.EXPO_PUBLIC_GITHUB_TOKEN = ORIGINAL_TOKEN;
      }
    });

    it('NÃO envia Authorization quando EXPO_PUBLIC_GITHUB_TOKEN está ausente', async () => {
      delete process.env.EXPO_PUBLIC_GITHUB_TOKEN;

      let capturedAuth: string | null = null;
      server.use(
        http.get(`${GITHUB_BASE_URL}/ping`, ({ request }) => {
          capturedAuth = request.headers.get('authorization');
          return HttpResponse.json({ ok: true });
        }),
      );

      await createHttpClient().get('/ping');

      expect(capturedAuth).toBeNull();
    });

    it('NÃO envia Authorization quando EXPO_PUBLIC_GITHUB_TOKEN é string vazia', async () => {
      process.env.EXPO_PUBLIC_GITHUB_TOKEN = '';

      let capturedAuth: string | null = null;
      server.use(
        http.get(`${GITHUB_BASE_URL}/ping`, ({ request }) => {
          capturedAuth = request.headers.get('authorization');
          return HttpResponse.json({ ok: true });
        }),
      );

      await createHttpClient().get('/ping');

      expect(capturedAuth).toBeNull();
    });

    it('envia Bearer <token> quando EXPO_PUBLIC_GITHUB_TOKEN está setado', async () => {
      process.env.EXPO_PUBLIC_GITHUB_TOKEN = 'ghp_test_token_123';

      let capturedAuth: string | null = null;
      server.use(
        http.get(`${GITHUB_BASE_URL}/ping`, ({ request }) => {
          capturedAuth = request.headers.get('authorization');
          return HttpResponse.json({ ok: true });
        }),
      );

      await createHttpClient().get('/ping');

      expect(capturedAuth).toBe('Bearer ghp_test_token_123');
    });
  });

  describe('timeout', () => {
    it('quando atinge o timeout configurado, mapHttpError gera NetworkError (não UnexpectedError)', async () => {
      server.use(
        http.get(`${GITHUB_BASE_URL}/slow`, async () => {
          await delay(500);
          return HttpResponse.json({ ok: true });
        }),
      );

      const client = createHttpClient({ timeoutMs: 50 });

      let mappedError: unknown;
      try {
        await client.get('/slow');
      } catch (err) {
        try {
          mapHttpError(err);
        } catch (mapped) {
          mappedError = mapped;
        }
      }

      expect(mappedError).toBeInstanceOf(NetworkError);
    });
  });
});
