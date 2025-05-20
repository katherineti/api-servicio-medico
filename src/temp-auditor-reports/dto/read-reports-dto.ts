import { ListReports } from 'src/db/types/reports.types';

export class ReportsGetAll {
  total: number;
  page: number;
  list: ListReports[];
}