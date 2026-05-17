import { createBox } from '@shopify/restyle';

import type { Theme } from 'src/infra/theme/lightTheme';

/**
 * Primitivo de layout — wrapper sobre View com props tipadas via theme.
 * Use para padding, margin, background, border, flex.
 *
 * @example
 * <Box backgroundColor="surface" padding="lg" borderRadius="xl">
 *   <Text variant="body">Hello</Text>
 * </Box>
 */
export const Box = createBox<Theme>();
export type BoxProps = React.ComponentProps<typeof Box>;
