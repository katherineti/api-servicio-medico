import { Providers } from "src/db/types/providers.types";

export class ProvidersGetAll {
  total: number;
  page?: number;
  list: Providers[];
}