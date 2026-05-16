import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata data como tempo relativo a agora ("há 3 dias", "há 2 horas").
 *
 * Wrapper fino sobre date-fns para isolar a dependência — se um dia
 * trocar lib (luxon, dayjs), mexe só aqui.
 *
 * @example
 * formatRelativeDate(new Date('2025-05-13')) // "há 3 dias"
 */
export function formatRelativeDate(date: Date): string {
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: ptBR,
  });
}
