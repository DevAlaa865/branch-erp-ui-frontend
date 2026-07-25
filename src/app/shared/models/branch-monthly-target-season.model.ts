export interface BranchMonthlyTargetSeasonExcelRowDto {
  branchNumber: number;
  targetMonth: number;
  targetYear: number;
  monthlyTargetAmount: number;
  notes?: string;
}

export interface BranchMonthlyTargetSeasonExcelUploadDto {
  rows: BranchMonthlyTargetSeasonExcelRowDto[];
}

export interface BranchMonthlyTargetSeasonReportFilterDto {
  cityIds?: number[];
  branchIds?: number[];
  month: number;
  year: number;
}

export interface BranchMonthlyTargetSeasonReportRowDto {
  branchId: number;
  branchNumber: number;
  branchName: string;

  targetMonth: number;
  targetYear: number;

  monthlyTargetAmount: number;
  monthlyAchievedAmount: number;

  remainingTo100: number;
  remainingTo85: number;

  achievementPercentage: number;
  notes?: string;
}
