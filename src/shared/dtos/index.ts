import { SortOrder } from '../enums';

export abstract class QueryParametersDefault {
  page: number;
  take: number;
  sort: SortOrder;
}
