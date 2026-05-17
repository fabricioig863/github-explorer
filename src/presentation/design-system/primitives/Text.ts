import { createText } from '@shopify/restyle';

import type { Theme } from 'src/infra/theme/lightTheme';

export const Text = createText<Theme>();
export type TextProps = React.ComponentProps<typeof Text>;
