import { useState } from 'react';
import { Image } from 'react-native';

import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  /** URL da imagem (geralmente avatar_url da API GitHub). */
  uri: string;
  /** Login do usuário — usado pra gerar iniciais de fallback. */
  login: string;
  size?: AvatarSize;
}

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 24,
  md: 36,
  lg: 48,
  xl: 68,
};

const SIZE_TEXT_VARIANT: Record<AvatarSize, 'caption' | 'bodySmall' | 'body' | 'h2'> = {
  sm: 'caption',
  md: 'bodySmall',
  lg: 'body',
  xl: 'h2',
};

function getInitials(login: string): string {
  const parts = login.split(/[-_. ]+/).filter((p) => p.length > 0);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    const part = parts[0];
    return part !== undefined && part.length > 0 ? part.charAt(0).toUpperCase() : '?';
  }
  const first = parts[0];
  const second = parts[1];
  const firstChar = first !== undefined && first.length > 0 ? first.charAt(0) : '';
  const secondChar = second !== undefined && second.length > 0 ? second.charAt(0) : '';
  return (firstChar + secondChar).toUpperCase();
}

/**
 * Avatar circular com fallback de iniciais quando imagem falha.
 * Tamanho via prop semântica (sm/md/lg/xl).
 *
 * NOTA: `style` no Image é exceção justificada — Image do RN não aceita props Restyle.
 * `borderRadius: sizePx / 2` cria círculo perfeito (token pill seria overkill aqui).
 *
 * @example
 * <Avatar uri="https://avatars.githubusercontent.com/u/69631" login="facebook" size="md" />
 */
export function Avatar({ uri, login, size = 'md' }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const sizePx = SIZE_PX[size];
  const initials = getInitials(login);

  if (errored) {
    return (
      <Box
        width={sizePx}
        height={sizePx}
        borderRadius="pill"
        backgroundColor="surfaceMuted"
        alignItems="center"
        justifyContent="center"
      >
        <Text variant={SIZE_TEXT_VARIANT[size]} color="fgMuted">
          {initials}
        </Text>
      </Box>
    );
  }

  return (
    <Image
      source={{ uri }}
      onError={() => setErrored(true)}
      style={{
        width: sizePx,
        height: sizePx,
        borderRadius: sizePx / 2,
      }}
      accessibilityLabel={`Avatar de ${login}`}
    />
  );
}
