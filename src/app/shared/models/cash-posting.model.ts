export interface PostDailyCashRequestDto {
  userId: string;
  date: string;
}

export interface CashPostingCityResultDto {
  cityId: number;
  cityName: string;
  cashBoxId: number;
  cashBoxName: string;
  totalDailyCash: number;
  alreadyPosted: boolean;
  hasMissingBranches: boolean;
  missingBranches: string[];
}

export interface CashPostingResultDto {
  userId: string;
  date: string;
  cities: CashPostingCityResultDto[];
}
