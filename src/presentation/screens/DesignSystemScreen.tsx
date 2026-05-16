import { useTheme } from '@shopify/restyle';
import { Search } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { useThemeMode, type ThemeModeContextValue } from '@/infrastructure/theme/AppThemeProvider';
import type { Theme } from '@/infrastructure/theme/lightTheme';
import { Avatar } from '@/presentation/design-system/Avatar';
import { Badge } from '@/presentation/design-system/Badge';
import { Button } from '@/presentation/design-system/Button';
import { Card } from '@/presentation/design-system/Card';
import { Input } from '@/presentation/design-system/Input';
import { Box } from '@/presentation/design-system/primitives/Box';
import { LanguageDot } from '@/presentation/design-system/primitives/LanguageDot';
import { Pill } from '@/presentation/design-system/primitives/Pill';
import { Spinner } from '@/presentation/design-system/primitives/Spinner';
import { Text } from '@/presentation/design-system/primitives/Text';

const COLOR_TOKENS: { name: keyof Theme['colors']; label: string }[] = [
  { name: 'bg', label: 'bg' },
  { name: 'surface', label: 'surface' },
  { name: 'surfaceMuted', label: 'surfaceMuted' },
  { name: 'border', label: 'border' },
  { name: 'fg', label: 'fg' },
  { name: 'fgMuted', label: 'fgMuted' },
  { name: 'fgSubtle', label: 'fgSubtle' },
  { name: 'accent', label: 'accent' },
  { name: 'success', label: 'success' },
  { name: 'warning', label: 'warning' },
  { name: 'danger', label: 'danger' },
];

export function DesignSystemScreen() {
  const theme = useTheme<Theme>();
  const themeMode = useThemeMode();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <Box padding="xxxl" gap="giga">
        <ThemeModeSection themeMode={themeMode} />
        <TypographySection />
        <ButtonsSection />
        <InputsSection />
        <BadgesSection />
        <CardsSection />
        <AvatarsSection />
        <PrimitivesSection />
        <ColorTokensSection />
      </Box>
    </ScrollView>
  );
}

interface ThemeModeSectionProps {
  themeMode: ThemeModeContextValue;
}

function ThemeModeSection({ themeMode }: ThemeModeSectionProps) {
  const { mode, setMode } = themeMode;
  return (
    <SectionWrapper title="THEME MODE" subtitle="Switch entre light, dark ou seguir o sistema.">
      <Box flexDirection="row" gap="md" flexWrap="wrap">
        <Button
          variant={mode === 'light' ? 'primary' : 'outline'}
          size="sm"
          onPress={() => setMode('light')}
        >
          Light
        </Button>
        <Button
          variant={mode === 'dark' ? 'primary' : 'outline'}
          size="sm"
          onPress={() => setMode('dark')}
        >
          Dark
        </Button>
        <Button
          variant={mode === 'system' ? 'primary' : 'outline'}
          size="sm"
          onPress={() => setMode('system')}
        >
          System
        </Button>
      </Box>
      <Text variant="caption">
        Selecionado: {mode} · Resolvido para: {themeMode.resolvedScheme}
      </Text>
    </SectionWrapper>
  );
}

function TypographySection() {
  return (
    <SectionWrapper title="TYPOGRAPHY" subtitle="Variantes de texto baseadas em tokens.">
      <Text variant="display">Display 32</Text>
      <Text variant="h1">Heading 1 — 22</Text>
      <Text variant="h2">Heading 2 — 18</Text>
      <Text variant="h3">Heading 3 — 15</Text>
      <Text variant="body">
        Body 14 — texto padrão para parágrafos e conteúdo principal da tela.
      </Text>
      <Text variant="bodySmall">Body Small 13 — texto secundário com cor fgMuted.</Text>
      <Text variant="caption">Caption 11 — geist mono, fgSubtle</Text>
      <Text variant="mono">Mono 12 — geist mono fgMuted</Text>
      <Text variant="monoStrong">Mono Strong 12 — geist mono medium</Text>
      <Text variant="eyebrow">EYEBROW · GEIST MONO</Text>
    </SectionWrapper>
  );
}

function ButtonsSection() {
  return (
    <SectionWrapper title="BUTTONS" subtitle="4 variants × 3 sizes × estados (loading, disabled).">
      <Text variant="caption">VARIANTS</Text>
      <Box gap="md">
        <Button variant="primary">Primary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost" leftIcon={<Search size={16} />}>
          Ghost com ícone
        </Button>
      </Box>

      <Text variant="caption">SIZES</Text>
      <Box flexDirection="row" gap="md" alignItems="center">
        <Button variant="primary" size="sm">
          sm
        </Button>
        <Button variant="primary" size="md">
          md
        </Button>
        <Button variant="primary" size="lg">
          lg
        </Button>
      </Box>

      <Text variant="caption">ESTADOS</Text>
      <Box gap="md">
        <Button variant="primary" loading>
          Loading
        </Button>
        <Button variant="primary" disabled>
          Disabled
        </Button>
      </Box>
    </SectionWrapper>
  );
}

function InputsSection() {
  return (
    <SectionWrapper title="INPUTS" subtitle="Label, error, helperText, leftIcon.">
      <Input label="Email" placeholder="seu@email.com" helperText="Vamos enviar confirmação" />
      <Input label="Buscar" placeholder="repo, user..." leftIcon={<Search size={16} />} />
      <Input label="Com erro" value="bad-input" error="Formato inválido" />
    </SectionWrapper>
  );
}

function BadgesSection() {
  return (
    <SectionWrapper title="BADGES" subtitle="Tones semânticas + dotColor custom (labels GitHub).">
      <Box flexDirection="row" gap="sm" flexWrap="wrap">
        <Badge tone="neutral">neutral</Badge>
        <Badge tone="info">info</Badge>
        <Badge tone="success">success</Badge>
        <Badge tone="warning">warning</Badge>
        <Badge tone="danger">danger</Badge>
      </Box>
      <Text variant="caption">DOT COLOR CUSTOM (GitHub labels)</Text>
      <Box flexDirection="row" gap="sm" flexWrap="wrap">
        <Badge dotColor="#d73a4a">bug</Badge>
        <Badge dotColor="#a2eeef">enhancement</Badge>
        <Badge dotColor="#0075ca">documentation</Badge>
        <Badge dotColor="#7057ff">good first issue</Badge>
      </Box>
    </SectionWrapper>
  );
}

function CardsSection() {
  return (
    <SectionWrapper title="CARDS" subtitle="Surface (border + bg) e Flat (sem border).">
      <Card variant="surface">
        <Box gap="sm">
          <Text variant="h3">Surface Card</Text>
          <Text variant="bodySmall">
            Card com borda + fundo. Usado em listas (RepoListItem, IssueListItem) e seções
            principais.
          </Text>
        </Box>
      </Card>
      <Card variant="flat">
        <Box gap="sm">
          <Text variant="h3">Flat Card</Text>
          <Text variant="bodySmall">
            Card sem borda, fundo surfaceMuted. Usado em StatsGrid do RepoDetail.
          </Text>
        </Box>
      </Card>
    </SectionWrapper>
  );
}

function AvatarsSection() {
  const uri = 'https://avatars.githubusercontent.com/u/69631';
  return (
    <SectionWrapper title="AVATARS" subtitle="4 tamanhos + fallback de iniciais quando URL falha.">
      <Text variant="caption">URLs VÁLIDAS</Text>
      <Box flexDirection="row" gap="lg" alignItems="center" flexWrap="wrap">
        <Avatar uri={uri} login="facebook" size="sm" />
        <Avatar uri={uri} login="facebook" size="md" />
        <Avatar uri={uri} login="facebook" size="lg" />
        <Avatar uri={uri} login="facebook" size="xl" />
      </Box>
      <Text variant="caption">FALLBACK COM INICIAIS</Text>
      <Box flexDirection="row" gap="lg" alignItems="center" flexWrap="wrap">
        <Avatar uri="https://invalid.local/x.png" login="dev.lucas" size="md" />
        <Avatar uri="https://invalid.local/x.png" login="john-doe" size="lg" />
        <Avatar uri="https://invalid.local/x.png" login="single" size="lg" />
      </Box>
    </SectionWrapper>
  );
}

function PrimitivesSection() {
  return (
    <SectionWrapper title="PRIMITIVES" subtitle="Pill, LanguageDot, Spinner.">
      <Text variant="caption">PILL</Text>
      <Box flexDirection="row" gap="sm" flexWrap="wrap">
        <Pill>react</Pill>
        <Pill>mobile</Pill>
        <Pill>typescript</Pill>
        <Pill>ios</Pill>
      </Box>

      <Text variant="caption">LANGUAGE DOT</Text>
      <Box flexDirection="row" gap="lg" flexWrap="wrap">
        <LanguageDot language="TypeScript" />
        <LanguageDot language="JavaScript" />
        <LanguageDot language="Rust" />
        <LanguageDot language="Go" />
        <LanguageDot language={null} />
      </Box>

      <Text variant="caption">SPINNER</Text>
      <Box flexDirection="row" gap="huge" alignItems="center">
        <Spinner size="small" color="fgSubtle" />
        <Spinner size="small" color="accent" />
        <Spinner size="large" color="accent" />
      </Box>
    </SectionWrapper>
  );
}

function ColorTokensSection() {
  const theme = useTheme<Theme>();
  return (
    <SectionWrapper
      title="COLOR TOKENS"
      subtitle="Paleta semântica do tema atual. Todas as cores do app vêm desses tokens — zero hex hardcoded em componentes."
    >
      <Box flexDirection="row" gap="md" flexWrap="wrap">
        {COLOR_TOKENS.map((token) => (
          <Box key={token.name} alignItems="center" gap="xs" width={80}>
            <Box
              width={56}
              height={56}
              borderRadius="lg"
              borderWidth={1}
              borderColor="border"
              style={{ backgroundColor: theme.colors[token.name] }}
            />
            <Text variant="caption">{token.label}</Text>
          </Box>
        ))}
      </Box>
    </SectionWrapper>
  );
}

interface SectionWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

function SectionWrapper({ title, subtitle, children }: SectionWrapperProps) {
  return (
    <Box gap="md">
      <Box gap="xs">
        <Text variant="eyebrow">{title}</Text>
        {subtitle !== undefined && (
          <Text variant="bodySmall" color="fgMuted">
            {subtitle}
          </Text>
        )}
      </Box>
      {children}
    </Box>
  );
}
