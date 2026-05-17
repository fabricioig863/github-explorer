import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatRelativeDate(date: Date): string {
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: ptBR,
  });
}
