/**
 * Repositório marcado como salvo pelo usuário. Persistido localmente
 * (AsyncStorage) — não há sincronização com servidor neste app.
 *
 * Snapshot dos campos visíveis em listagens: o que se vê em SavedRepoRow
 * (avatar, fullName, language, savedAt) e o htmlUrl pra abrir no browser.
 * Detalhes ricos (stars, forks etc) NÃO são duplicados aqui — quando o
 * usuário clica em um SavedRepo, a tela de detalhes re-busca via API.
 */
export interface SavedRepo {
  id: number;
  fullName: string;
  name: string;
  ownerLogin: string;
  ownerAvatarUrl: string;
  language: string | null;
  htmlUrl: string;
  savedAt: Date;
}
