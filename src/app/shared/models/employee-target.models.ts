// أداء الفرع اليومي
export interface BranchDailyPerformanceDto {
  branchId: number;
  branchName?: string;
  targetDate: string;
  branchTargetAmount?: number | null;
  branchAchievedAmount?: number | null;
  branchInvoicesCountAchieved?: number | null;
  branchItemsCountAchieved?: number | null;
  achievementPercentage?: number | null;
}

export interface BranchDailyPerformanceCreateUpdateDto {
  branchId: number;
  targetDate: string;
  branchTargetAmount?: number | null;
  branchAchievedAmount?: number | null;
  branchInvoicesCountAchieved?: number | null;
  branchItemsCountAchieved?: number | null;
}

// هيدر تارجت الشيفت
export interface EmployeeShiftTargetHeaderDto {
  id: number;
  branchId: number;
  branchName?: string;
  targetDate: string;
  shift: number;
  totalShiftTarget?: number | null;
}

export interface EmployeeShiftTargetHeaderCreateDto {
  branchId: number;
  targetDate: string;
  shift: number;
  totalShiftTarget?: number | null;
}

// التارجت الشخصي
export interface EmployeePersonalTargetDto {
  id: number;
  shiftHeaderId: number;
  employeeId: number;
  employeeName?: string;
  personalTargetAmount: number;
  status?: string | null;
}

export interface EmployeePersonalTargetCreateDto {
  shiftHeaderId: number;
  employeeId: number;
  personalTargetAmount: number;
  status?: string | null;
}

// إنجاز الموظفة + المرفق
export interface EmployeePersonalAchievementDto {
  id: number;
  employeePersonalTargetId: number;
  achievedAmount: number;
  invoicesCount?: number | null;
  itemsCount?: number | null;
  achievementPercentage?: number | null;
  isTargetAchieved?: boolean | null;
  commissionAmount?: number | null;
  attachmentPath?: string | null;
}

export interface EmployeePersonalAchievementCreateDto {
  employeePersonalTargetId: number;
  achievedAmount: number;
  invoicesCount?: number | null;
  itemsCount?: number | null;
  attachmentPath?: string | null;
}
