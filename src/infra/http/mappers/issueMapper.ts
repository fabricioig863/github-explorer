import type { Issue } from '@/domain/entities/Issue';
import type { Label } from '@/domain/entities/Label';
import type { IssueDto, LabelDto } from 'src/infra/http/dtos/IssueDto';

function mapLabel(dto: LabelDto): Label {
  return {
    id: dto.id,
    name: dto.name,
    color: dto.color,
  };
}

export function mapIssue(dto: IssueDto): Issue {
  return {
    id: dto.id,
    number: dto.number,
    title: dto.title,
    state: dto.state,
    author: {
      login: dto.user.login,
      avatarUrl: dto.user.avatar_url,
    },
    labels: dto.labels.map(mapLabel),
    commentsCount: dto.comments,
    createdAt: new Date(dto.created_at),
    htmlUrl: dto.html_url,
  };
}
