export interface IPaginationInterface {
  page: number | null | any;
  pageSize: number | null | any;
}

export interface IPaginateSkipTake {
  skip: number;
  take: number;
}

export interface IPaginatePayload {
  page?: number;
  limit?: number;
  search?: string | any;
  isDropdown?: string | boolean | any;
}

export interface IPaginateResult {
  [key: string]: any;
  totalData: number;
  totalFiltered: number;
}
