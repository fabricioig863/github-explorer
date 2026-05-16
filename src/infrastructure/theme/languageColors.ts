// Mapa de cores das linguagens de programação.
// Origem: GitHub Linguist (https://github.com/github-linguist/linguist/blob/main/lib/linguist/languages.yml)
// NÃO está no theme porque cor de linguagem é dado externo, não decisão de tema —
// não muda entre light/dark. Vive aqui como mapa estático.
export const LANGUAGE_COLORS: Readonly<Record<string, string>> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#663399',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Lua: '#000080',
  R: '#198CE7',
  Perl: '#0298c3',
  Haskell: '#5e5086',
  Elixir: '#6e4a7e',
  Clojure: '#db5855',
  Erlang: '#B83998',
  'Objective-C': '#438eff',
  Assembly: '#6E4C13',
  Makefile: '#427819',
  Dockerfile: '#384d54',
  PowerShell: '#012456',
  TeX: '#3D6117',
  Vim: '#199f4b',
  Nix: '#7e7eff',
  Zig: '#ec915c',
  Solidity: '#AA6746',
};

const FALLBACK_COLOR = '#8a877f';

export function languageColorOrFallback(language: string | null): string {
  if (language === null) return FALLBACK_COLOR;
  return LANGUAGE_COLORS[language] ?? FALLBACK_COLOR;
}
