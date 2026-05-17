import { createText } from '@shopify/restyle';

import type { Theme } from 'src/infra/theme/lightTheme';

/**
 * Primitivo de texto — wrapper sobre Text com variants tipadas via theme.
 * `variant` aceita: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' |
 *                   'caption' | 'mono' | 'monoStrong' | 'eyebrow'
 *
 * @example
 * <Text variant="h1">Explorar</Text>
 * <Text variant="bodySmall" color="fgMuted">Descrição</Text>
 */
export const Text = createText<Theme>();
export type TextProps = React.ComponentProps<typeof Text>;
