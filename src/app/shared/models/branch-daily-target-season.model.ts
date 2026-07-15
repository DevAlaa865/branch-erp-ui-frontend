export interface BranchDailyTargetSeasonExcelRowDto {
  branchNumber: number;
  targetDate: string;          // yyyy-MM-dd
  dailyTargetAmount: number;
  achievedAmount: number;
  achievedPercentage: number;
  notes?: string;
}

export interface BranchDailyTargetSeasonExcelUploadDto {
  rows: BranchDailyTargetSeasonExcelRowDto[];
}

export interface BranchDailyTargetSeasonDto {
  id: number;
  branchId: number;
  branchName: string;
  targetDate: string;
  dailyTargetAmount: number;
  achievedAmount: number;
  achievedPercentage: number;
  notes?: string;
}

export interface BranchDailyTargetSeasonUpdateDto {
  id: number;
  achievedAmount: number;
  notes?: string;
}

export interface BranchDailyTargetSeasonReportFilterDto {
  cityIds?: number[];
  branchIds?: number[];
  fromDate: string;   // ISO string
  toDate: string;     // ISO string
}

export interface BranchDailyTargetSeasonReportRowDto {
  branchId: number;
  branchName: string;
  totalTargetAmount: number;
  totalAchievedAmount: number;
  achievementPercentage: number;
  notes?: string;
}
export interface BranchDailyTargetSeasonChartDto {
  targetDate: string;
  dailyTargetAmount: number;
  achievedAmount: number;
  achievementPercentage: number;
  branchId: number;
  branchName: string;
  
}
