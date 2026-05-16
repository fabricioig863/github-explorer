import type { Label } from '@/domain/entities/Label';
import type { Owner } from '@/domain/entities/Owner';

export interface Issue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  author: Pick<Owner, 'login' | 'avatarUrl'>;
  labels: Label[];
  commentsCount: number;
  createdAt: Date;
  htmlUrl: string;
}
