import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import { languageColorOrFallback } from 'src/infra/theme/languageColors';

interface LanguageDotProps {
  language: string | null;
}

export function LanguageDot({ language }: LanguageDotProps) {
  const color = languageColorOrFallback(language);

  return (
    <Box flexDirection="row" alignItems="center" gap="sm">
      <Box width={9} height={9} borderRadius="pill" style={{ backgroundColor: color }} />
      {language !== null && <Text variant="mono">{language}</Text>}
    </Box>
  );
}
