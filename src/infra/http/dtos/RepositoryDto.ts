/**
 * Shape exato do que o GitHub retorna pra um repository.
 * Apenas os campos que consumimos — não preciso modelar tudo.
 */
export interface OwnerDto {
  id: number;
  login: string;
  avatar_url: string;
  type: 'User' | 'Organization';
}

export interface LicenseDto {
  name: string;
  spdx_id: string | null;
}

export interface RepositoryDto {
  id: number;
  name: string;
  full_name: string;
  owner: OwnerDto;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  html_url: string;
  pushed_at: string;
  topics?: string[];
  license?: LicenseDto | null;
}

/**
 * Resposta da Search API. GitHub retorna wrapper específico em /search.
 */
export interface SearchRepositoriesResponseDto {
  total_count: number;
  incomplete_results: boolean;
  items: RepositoryDto[];
}
