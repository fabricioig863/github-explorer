import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';

import { NetworkError } from '@/domain/errors/NetworkError';
import { NotFoundError } from '@/domain/errors/NotFoundError';
import { RateLimitError } from '@/domain/errors/RateLimitError';
import { UnexpectedError } from '@/domain/errors/UnexpectedError';

import { mapHttpError } from 'src/infra/http/errorMapper';

function makeAxiosError(
  status: number | undefined,
  headers: Record<string, string> = {},
): AxiosError {
  const err = new AxiosError('boom', undefined, undefined, undefined);
  if (status !== undefined) {
    err.response = {
      status,
      statusText: '',
      headers,
      config: { headers: new AxiosHeaders() } as never,
      data: undefined,
    } as unknown as AxiosResponse;
  }
  return err;
}

describe('mapHttpError', () => {
  it('throws UnexpectedError when error is not an AxiosError', () => {
    expect(() => mapHttpError(new Error('plain'))).toThrow(UnexpectedError);
    expect(() => mapHttpError('string')).toThrow(UnexpectedError);
    expect(() => mapHttpError(undefined)).toThrow(UnexpectedError);
  });

  it('throws NetworkError when AxiosError has no response (DNS / offline)', () => {
    const err = new AxiosError('Network', 'ECONNABORTED');
    expect(() => mapHttpError(err)).toThrow(NetworkError);
  });

  it('throws RateLimitError on status 429', () => {
    const err = makeAxiosError(429);
    expect(() => mapHttpError(err)).toThrow(RateLimitError);
  });

  it('parses x-ratelimit-reset (unix seconds) into Date on RateLimitError', () => {
    const resetUnix = 1900000000;
    const err = makeAxiosError(429, { 'x-ratelimit-reset': String(resetUnix) });

    try {
      mapHttpError(err);
      fail('expected throw');
    } catch (thrown) {
      expect(thrown).toBeInstanceOf(RateLimitError);
      const rate = thrown as RateLimitError;
      expect(rate.resetAt).toEqual(new Date(resetUnix * 1000));
    }
  });

  it('throws RateLimitError on status 403 when x-ratelimit-remaining=0', () => {
    const err = makeAxiosError(403, { 'x-ratelimit-remaining': '0' });
    expect(() => mapHttpError(err)).toThrow(RateLimitError);
  });

  it('throws UnexpectedError on status 403 without rate-limit header', () => {
    const err = makeAxiosError(403, { 'x-ratelimit-remaining': '42' });
    expect(() => mapHttpError(err)).toThrow(UnexpectedError);
    expect(() => mapHttpError(err)).not.toThrow(RateLimitError);
  });

  it('throws NotFoundError with context on status 404', () => {
    const err = makeAxiosError(404);
    try {
      mapHttpError(err, 'Repositório foo/bar');
      fail('expected throw');
    } catch (thrown) {
      expect(thrown).toBeInstanceOf(NotFoundError);
      expect((thrown as NotFoundError).message).toContain('foo/bar');
    }
  });

  it('falls back to "Recurso" on 404 without ctx', () => {
    const err = makeAxiosError(404);
    try {
      mapHttpError(err);
      fail('expected throw');
    } catch (thrown) {
      expect((thrown as NotFoundError).message).toBe('Recurso não foi encontrado.');
    }
  });

  it('throws UnexpectedError on status 500', () => {
    const err = makeAxiosError(500);
    expect(() => mapHttpError(err)).toThrow(UnexpectedError);
  });

  it('returns undefined resetAt when x-ratelimit-reset is not a valid number', () => {
    const err = makeAxiosError(429, { 'x-ratelimit-reset': 'nope' });
    try {
      mapHttpError(err);
      fail('expected throw');
    } catch (thrown) {
      expect((thrown as RateLimitError).resetAt).toBeUndefined();
    }
  });

  it('returns undefined resetAt when x-ratelimit-reset header is absent', () => {
    const err = makeAxiosError(429);
    try {
      mapHttpError(err);
      fail('expected throw');
    } catch (thrown) {
      expect((thrown as RateLimitError).resetAt).toBeUndefined();
    }
  });
});
