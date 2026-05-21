import { useTheme } from '@shopify/restyle';
import { Search } from 'lucide-react-native';

import { Input } from '@/presentation/design-system/Input';
import { Box } from '@/presentation/design-system/primitives/Box';
import type { Theme } from 'src/infra/theme/lightTheme';

interface SearchHeaderProps {
  query: string;
  onChangeQuery: (q: string) => void;
}

export function SearchHeader({ query, onChangeQuery }: SearchHeaderProps) {
  const theme = useTheme<Theme>();
  return (
    <Box paddingHorizontal="xxxl" paddingTop="md" paddingBottom="md">
      <Input
        placeholder="react native, typescript..."
        value={query}
        onChangeText={onChangeQuery}
        leftIcon={<Search size={16} color={theme.colors.fgSubtle} />}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </Box>
  );
}
