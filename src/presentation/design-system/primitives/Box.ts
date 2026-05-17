import { createBox } from '@shopify/restyle';

import type { Theme } from 'src/infra/theme/lightTheme';

export const Box = createBox<Theme>();
export type BoxProps = React.ComponentProps<typeof Box>;
