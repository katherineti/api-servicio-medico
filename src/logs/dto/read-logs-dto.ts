import { Log } from "src/db/types/logs.types";

export class ResultGetAllLogs{
  total: number;
  page: number;
  list:Log[];
}