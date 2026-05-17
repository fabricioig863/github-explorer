import { useTheme } from '@shopify/restyle';
import { Bookmark, BookmarkCheck } from 'lucide-react-native';
import { Pressable } from 'react-native';

import type { Theme } from 'src/infra/theme/lightTheme';

interface BookmarkButtonProps {
  isSaved: boolean;
  disabled?: boolean;
  onPress: () => void;
}

/**
 * Ícone-botão usado no header de RepoDetail. Alterna entre Bookmark vazio
 * (não salvo) e BookmarkCheck cheio (salvo). Sem texto — espaço de header
 * é pequeno; estado é comunicado pelo ícone e pelo `accessibilityState`.
 */
export function BookmarkButton({ isSaved, disabled = false, onPress }: BookmarkButtonProps) {
  const theme = useTheme<Theme>();
  const color = isSaved ? theme.colors.accent : theme.colors.fg;
  const Icon = isSaved ? BookmarkCheck : Bookmark;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: isSaved }}
      accessibilityLabel={isSaved ? 'Remover dos salvos' : 'Salvar repositório'}
      style={({ pressed }) => ({
        opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
        paddingHorizontal: 4,
      })}
    >
      <Icon size={22} color={color} fill={isSaved ? color : 'transparent'} />
    </Pressable>
  );
}
