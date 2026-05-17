function looksLikeRepoPath(q: string): boolean {
  const [owner, repo, extra] = q.split('/');
  return (
    owner !== undefined &&
    owner.length > 0 &&
    repo !== undefined &&
    repo.length > 0 &&
    extra === undefined
  );
}

export function getEmptySearchCopy(query: string): { title: string; description: string } {
  const trimmed = query.trim();
  if (looksLikeRepoPath(trimmed)) {
    return {
      title: 'Nenhum repositório encontrado',
      description: `Verifique se "${trimmed}" é owner/repositório válido no GitHub.`,
    };
  }
  return {
    title: 'Nenhum repositório encontrado',
    description: 'Tente buscar com termos diferentes.',
  };
}
