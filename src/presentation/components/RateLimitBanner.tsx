import { useTheme } from '@shopify/restyle';
import { AlertTriangle } from 'lucide-react-native';

import { RateLimitError } from '@/domain/errors/RateLimitError';
import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import { formatRelativeDate } from '@/presentation/utils/formatRelativeDate';
import type { Theme } from 'src/infra/theme/lightTheme';

interface RateLimitBannerProps {
  error: unknown;
}

export function RateLimitBanner({ error }: RateLimitBannerProps) {
  const theme = useTheme<Theme>();
  if (!(error instanceof RateLimitError)) return null;

  const retryHint =
    error.resetAt !== undefined
      ? `Tente novamente ${formatRelativeDate(error.resetAt)}.`
      : 'Aguarde alguns minutos antes de tentar novamente.';

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      gap="md"
      paddingHorizontal="xxxl"
      paddingVertical="md"
      backgroundColor="surfaceMuted"
      borderBottomColor="border"
      borderBottomWidth={1}
      accessibilityRole="alert"
      accessibilityLabel="Limite de requisições atingido"
    >
      <AlertTriangle size={16} color={theme.colors.warning} />
      <Box flex={1}>
        <Text variant="caption" color="fg">
          Limite da API do GitHub atingido.
        </Text>
        <Text variant="caption" color="fgMuted">
          {retryHint}
        </Text>
      </Box>
    </Box>
  );
}
