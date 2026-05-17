import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import { languageColorOrFallback } from 'src/infra/theme/languageColors';

interface LanguageDotProps {
  language: string | null;
}

/**
 * Bolinha colorida + nome da linguagem — mesmo padrão visual do github.com.
 * Quando `language` é null, mostra apenas a bolinha em cor neutra.
 *
 * NOTA: cor da bolinha é estilo inline porque vem de mapa externo (linguist),
 * não do theme. Isso é exceção justificada à regra "sem style solto".
 *
 * @example
 * <LanguageDot language="TypeScript" />
 */
export function LanguageDot({ language }: LanguageDotProps) {
  const color = languageColorOrFallback(language);

  return (
    <Box flexDirection="row" alignItems="center" gap="sm">
      <Box width={9} height={9} borderRadius="pill" style={{ backgroundColor: color }} />
      {language !== null && <Text variant="mono">{language}</Text>}
    </Box>
  );
}
