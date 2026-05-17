export interface PaginatedResult<T> {
  items: T[];
  /**
   * Total de resultados disponíveis no servidor. Opcional porque alguns
   * endpoints paginados (GitHub /issues, por exemplo) não fornecem
   * esse número. UI deve lidar com ausência.
   */
  totalCount?: number;
  hasNextPage: boolean;
}
