import { lightTheme, type Theme } from 'src/infra/theme/lightTheme';
import { palette } from 'src/infra/theme/tokens/palette';

// darkTheme compartilha estrutura (spacing/radii/textVariants/buttonVariants)
// com lightTheme — só troca o objeto colors.
// Tipagem `: Theme` força equivalência estrutural — esquecer uma cor falha em compile.
export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    bg: palette.ink900,
    surface: palette.ink800,
    surfaceMuted: palette.ink700,
    border: palette.ink600,
    borderStrong: palette.ink500,
    fg: palette.ink50,
    fgMuted: palette.ink100,
    fgSubtle: palette.inkSubtle,
    accent: palette.accentDark,
    accentSoft: palette.accentSoftDark,
    accentText: palette.ink900,
    success: palette.successDark,
    warning: palette.warningDark,
    danger: palette.dangerDark,
    dangerBg: palette.dangerBgDark,
    transparent: palette.transparent,
  },
};
