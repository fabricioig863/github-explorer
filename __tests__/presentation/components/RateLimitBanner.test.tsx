import { screen } from '@testing-library/react-native';

import { NetworkError } from '@/domain/errors/NetworkError';
import { RateLimitError } from '@/domain/errors/RateLimitError';
import { RateLimitBanner } from '@/presentation/components/RateLimitBanner';

import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('RateLimitBanner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-17T12:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());

  it('renders nothing when the error is not a RateLimitError', () => {
    const { toJSON } = renderWithProviders(<RateLimitBanner error={new NetworkError()} />, {
      withNavigation: false,
    });
    expect(toJSON()).toBeNull();
  });

  it('renders nothing when error is undefined', () => {
    const { toJSON } = renderWithProviders(<RateLimitBanner error={undefined} />, {
      withNavigation: false,
    });
    expect(toJSON()).toBeNull();
  });

  it('renders title and generic retry hint when resetAt is missing', () => {
    renderWithProviders(<RateLimitBanner error={new RateLimitError()} />, {
      withNavigation: false,
    });
    expect(screen.getByText('Limite da API do GitHub atingido.')).toBeTruthy();
    expect(screen.getByText('Aguarde alguns minutos antes de tentar novamente.')).toBeTruthy();
  });

  it('renders a precise retry hint formatted with resetAt', () => {
    const reset = new Date('2026-05-17T12:10:00Z');
    renderWithProviders(
      <RateLimitBanner error={new RateLimitError(undefined, reset)} />,
      { withNavigation: false },
    );
    expect(screen.getByText('Tente novamente em 10 minutos.')).toBeTruthy();
  });
});
