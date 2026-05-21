import { useTheme } from '@shopify/restyle';
import { FileCode, GitBranch, Scale } from 'lucide-react-native';

import type { Repository } from '@/domain/entities/Repository';
import { Box } from '@/presentation/design-system/primitives/Box';
import { LanguageDot } from '@/presentation/design-system/primitives/LanguageDot';
import { formatRelativeDate } from '@/presentation/utils/formatRelativeDate';
import type { Theme } from 'src/infra/theme/lightTheme';

import { MetaRow } from './MetaRow';

export function RepoMeta({ repo }: { repo: Repository }) {
  const theme = useTheme<Theme>();
  return (
    <Box
      borderRadius="xxl"
      backgroundColor="surface"
      borderColor="border"
      borderWidth={1}
      overflow="hidden"
    >
      <MetaRow
        icon={<FileCode size={16} color={theme.colors.fgMuted} />}
        label="Linguagem"
        value={<LanguageDot language={repo.language} />}
      />
      <MetaRow
        icon={<Scale size={16} color={theme.colors.fgMuted} />}
        label="Licença"
        value={repo.license ?? '—'}
      />
      <MetaRow
        icon={<GitBranch size={16} color={theme.colors.fgMuted} />}
        label="Último commit"
        value={formatRelativeDate(repo.pushedAt)}
        isLast
      />
    </Box>
  );
}
