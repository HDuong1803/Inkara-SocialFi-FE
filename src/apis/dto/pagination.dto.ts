export interface OutputPagination {
  page: number;
  limit: number;
  sort: string;
  order: string;
}

export interface InputPagination {
  startId?: string | null;
  offset?: number;
  limit?: number;
}