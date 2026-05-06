export interface BranchTargetPeriodRow {
  targetDate: string;
  totalTarget: number;
  totalAchieved: number;
  achievementPercentage: number;
}

export interface BranchTargetPeriodReport {
  cityName: string;
  branchName: string;
  supervisorName: string;
  rows: BranchTargetPeriodRow[];
}

export interface BranchDailyTargetDetailDto {
  id?: number;
  employeeId: number;
  employeeName?: string;
  shift: number;
  employeeTarget?: number | null;
  employeeAchieved?: number | null;
  employeeAchievementPercentage?: number | null;
  employeeCommission?: number | null;
}

export interface BranchDailyTargetHeaderDto {
  id: number;
  branchId: number;
  branchName?: string;
  targetDate: string;
  totalBranchTarget?: number | null;
  totalAchieved?: number | null;
  achievementPercentage?: number | null;
  branchCommission?: number | null;
  details: BranchDailyTargetDetailDto[];
}

export interface BranchDailyTargetDetailCreateUpdateDto {
  employeeId: number;
  shift: number;
  employeeTarget?: number | null;
  employeeAchieved?: number | null;
}

export interface BranchDailyTargetHeaderCreateUpdateDto {
  branchId: number;
  targetDate: string;
  totalBranchTarget?: number | null;
  totalAchieved?: number | null;
  details: BranchDailyTargetDetailCreateUpdateDto[];
}
