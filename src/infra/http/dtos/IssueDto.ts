import type { OwnerDto } from 'src/infra/http/dtos/RepositoryDto';

export interface LabelDto {
  id: number;
  name: string;
  color: string;
}

export interface IssueDto {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  user: Pick<OwnerDto, 'login' | 'avatar_url'>;
  labels: LabelDto[];
  comments: number;
  created_at: string;
  html_url: string;
}
