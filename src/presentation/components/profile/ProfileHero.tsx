import { useTheme } from '@shopify/restyle';
import { Link as LinkIcon, MapPin } from 'lucide-react-native';
import { View } from 'react-native';

import type { UserProfile } from '@/domain/entities/UserProfile';
import { AvatarRing } from '@/presentation/components/profile/AvatarRing';
import { Box } from '@/presentation/design-system/primitives/Box';
import { Text } from '@/presentation/design-system/primitives/Text';
import type { Theme } from 'src/infra/theme/lightTheme';

interface ProfileHeroProps {
  profile: UserProfile;
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  const theme = useTheme<Theme>();
  const displayName = profile.name ?? profile.login;

  return (
    <Box paddingHorizontal="huge" paddingTop="lg" paddingBottom="xxxl">
      <Box flexDirection="row" alignItems="center" gap="xxl" marginBottom="xxl">
        <AvatarRing avatarUrl={profile.avatarUrl} />
        <Box flex={1}>
          <Text variant="h2">{displayName}</Text>
          <Text variant="mono" color="fgSubtle">
            @{profile.login}
          </Text>
        </Box>
      </Box>

      {profile.bio !== null && profile.bio.length > 0 ? (
        <Text variant="body" color="fgMuted" marginBottom="md">
          {profile.bio}
        </Text>
      ) : null}

      {(profile.location !== null || profile.website !== null) && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 14,
            marginBottom: 12,
          }}
        >
          {profile.location !== null && (
            <Box flexDirection="row" alignItems="center" gap="xs">
              <MapPin size={12} color={theme.colors.fgSubtle} />
              <Text variant="caption">{profile.location}</Text>
            </Box>
          )}
          {profile.website !== null && (
            <Box flexDirection="row" alignItems="center" gap="xs">
              <LinkIcon size={12} color={theme.colors.fgSubtle} />
              <Text variant="caption">{profile.website}</Text>
            </Box>
          )}
        </View>
      )}

      <Box flexDirection="row" gap="huge">
        <StatItem label="seguidores" value={profile.followers} />
        <StatItem label="seguindo" value={profile.following} />
        <StatItem label="repos" value={profile.publicRepos} />
      </Box>
    </Box>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <Box flexDirection="row" alignItems="baseline" gap="xs">
      <Text variant="monoStrong" color="fg">
        {value.toLocaleString('pt-BR')}
      </Text>
      <Text variant="caption">{label}</Text>
    </Box>
  );
}
