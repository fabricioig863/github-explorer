import { useEffect, useState } from 'react';

/**
 * Retorna o valor depois de aguardar `delay` ms sem mudanças.
 * Útil para inputs que disparam buscas — evita request a cada tecla.
 *
 * @example
 * const [query, setQuery] = useState('');
 * const debounced = useDebounce(query, 300);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
}
