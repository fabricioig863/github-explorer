import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import { languageColorOrFallback } from 'src/infra/theme/languageColors';

interface LanguageDotProps {
  language: string | null;
}

export function LanguageDot({ language }: LanguageDotProps) {
  const color = languageColorOrFallback(language);

  return (
    <Box flexDirection="row" alignItems="center" gap="sm" style={{ flexShrink: 1, minWidth: 0 }}>
      <Box width={9} height={9} borderRadius="pill" style={{ backgroundColor: color }} />
      {language !== null && (
        <Text variant="mono" numberOfLines={1} style={{ flexShrink: 1 }}>
          {language}
        </Text>
      )}
    </Box>
  );
}
